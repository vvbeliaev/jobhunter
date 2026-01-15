import { Collections, pb, type UserJobMapResponse } from '$lib';

class UserJobsStore {
	private userId: string | null = null;
	userJobMaps: Record<string, UserJobMapResponse> = $state({});

	async load(userId: string) {
		this.userId = userId;
		const maps = await pb.collection(Collections.UserJobMap).getFullList<UserJobMapResponse>({
			filter: `user = "${userId}"`
		});

		const mapObj: Record<string, UserJobMapResponse> = {};
		for (const m of maps) {
			if (m.job) {
				mapObj[m.job] = m;
			}
		}
		this.userJobMaps = mapObj;
	}

	private async getOrCreateMap(jobId: string) {
		if (!this.userId) throw new Error('User not logged in');

		if (this.userJobMaps[jobId]) {
			return this.userJobMaps[jobId];
		}

		// Create lazily
		const newMap = await pb.collection(Collections.UserJobMap).create<UserJobMapResponse>({
			user: this.userId,
			job: jobId
		});

		this.userJobMaps[jobId] = newMap;
		return newMap;
	}

	async toggleArchive(jobId: string) {
		const map = await this.getOrCreateMap(jobId);
		const archived = map.archived ? null : new Date().toISOString();

		const updated = await pb.collection(Collections.UserJobMap).update<UserJobMapResponse>(map.id, {
			archived
		});

		this.userJobMaps[jobId] = updated;
	}

	async generateOffer(jobId: string) {
		const res = await pb.send(`/api/jobs/${jobId}/generate-offer`, {
			method: 'POST',
			headers: {
				Authorization: pb.authStore.token
			}
		});
		if (!res.ok) throw new Error('Failed to generate offer');
		const data = await res.json();

		// Update will come via subscription if active, but we update locally for immediate feedback
		if (this.userJobMaps[jobId]) {
			this.userJobMaps[jobId] = { ...this.userJobMaps[jobId], offer: data.offer };
		} else {
			// This shouldn't happen normally as the backend saves it, but just in case
			await this.load(this.userId!);
		}
		return data.offer;
	}

	isArchived(jobId: string) {
		return !!this.userJobMaps[jobId]?.archived;
	}

	getOffer(jobId: string) {
		return this.userJobMaps[jobId]?.offer || null;
	}

	isOffer(jobId: string) {
		return !!this.userJobMaps[jobId]?.offer;
	}

	async subscribe() {
		if (!this.userId) return;

		return pb.collection(Collections.UserJobMap).subscribe<UserJobMapResponse>('*', (e) => {
			if (e.record.user !== this.userId) return;

			if (e.action === 'create' || e.action === 'update') {
				if (e.record.job) {
					this.userJobMaps[e.record.job] = e.record;
				}
			} else if (e.action === 'delete') {
				// We don't really know which job it was from the record easily if we only have the map id,
				// but e.record is the full record.
				if (e.record.job) {
					delete this.userJobMaps[e.record.job];
				}
			}
		});
	}

	unsubscribe() {
		pb.collection(Collections.UserJobMap).unsubscribe('*');
	}

	clear() {
		this.userJobMaps = {};
		this.userId = null;
	}
}

export const userJobsStore = new UserJobsStore();
