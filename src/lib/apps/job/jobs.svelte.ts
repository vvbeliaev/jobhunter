import { Collections, pb, type JobsResponse } from '$lib';
import { userJobsStore } from './user-jobs.svelte';

class JobsStore {
	private userId: string | null = null;

	jobs: JobsResponse[] = $state([]);
	search = $state('');
	filterRemote: boolean | null = $state(null);
	filterGrade = $state('');
	showArchived = $state(false);

	filteredJobs = $derived.by(() => {
		let result = this.jobs || [];

		if (!this.showArchived) {
			result = result.filter((j) => !userJobsStore.isArchived(j.id));
		} else {
			result = result.filter((j) => userJobsStore.isArchived(j.id));
		}

		if (this.search) {
			const s = this.search.toLowerCase();
			result = result.filter((j) => {
				return (
					j.title.toLowerCase().includes(s) ||
					j.company?.toLowerCase().includes(s) ||
					j.description?.toLowerCase().includes(s)
				);
			});
		}

		if (this.filterRemote !== null) {
			result = result.filter((j) => j.isRemote === this.filterRemote);
		}

		if (this.filterGrade) {
			result = result.filter((j) =>
				j.grade?.toLowerCase().includes(this.filterGrade.toLowerCase())
			);
		}

		return result;
	});

	async load(userId: string) {
		this.userId = userId;

		// Load jobs directly
		const jobs = await pb.collection(Collections.Jobs).getFullList<JobsResponse>({
			filter: 'status = "processed"',
			sort: '-created'
		});

		this.jobs = jobs;

		// Also ensure user jobs are loaded
		await userJobsStore.load(userId);

		return this.jobs;
	}

	set(jobs: JobsResponse[]) {
		this.jobs = jobs;
	}

	async subscribe() {
		if (!this.userId) return;

		await userJobsStore.subscribe();

		return pb.collection(Collections.Jobs).subscribe<JobsResponse>('*', async (e) => {
			switch (e.action) {
				case 'create': {
					if (e.record.status === 'processed') {
						this.jobs.unshift(e.record);
					}
					break;
				}
				case 'update': {
					if (e.record.status === 'processed') {
						const exists = this.jobs.find((j) => j.id === e.record.id);
						if (exists) {
							this.jobs = this.jobs.map((j) => (j.id === e.record.id ? e.record : j));
						} else {
							this.jobs.unshift(e.record);
						}
					} else {
						this.jobs = this.jobs.filter((j) => j.id !== e.record.id);
					}
					break;
				}
				case 'delete':
					this.jobs = this.jobs.filter((j) => j.id !== e.record.id);
					break;
			}
		});
	}

	unsubscribe() {
		pb.collection(Collections.Jobs).unsubscribe('*');
		userJobsStore.unsubscribe();
	}

	clear() {
		this.jobs = [];
		this.userId = null;
		userJobsStore.clear();
	}
}

export const jobsStore = new JobsStore();
