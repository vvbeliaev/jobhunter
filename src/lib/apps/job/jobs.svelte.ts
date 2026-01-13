import { Collections, pb, type JobsResponse } from '$lib';

class JobsStore {
	private userId: string | null = null;

	jobs: JobsResponse[] = $state([]);
	search = $state('');
	filterRemote: boolean | null = $state(null);
	filterGrade = $state('');

	filteredJobs = $derived.by(() => {
		let result = this.jobs || [];

		if (this.search) {
			const s = this.search.toLowerCase();
			result = result.filter(
				(j) =>
					j.title.toLowerCase().includes(s) ||
					j.company?.toLowerCase().includes(s) ||
					j.description?.toLowerCase().includes(s)
			);
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
		const jobs = await pb.collection(Collections.Jobs).getFullList({
			filter: `user = "${userId}"`,
			sort: '-created'
		});

		this.userId = userId;

		return jobs;
	}

	set(jobs: JobsResponse[]) {
		this.jobs = jobs;
	}

	async subscribe() {
		if (!this.userId) return;

		return pb.collection(Collections.Jobs).subscribe(
			'*',
			(e) => {
				switch (e.action) {
					case 'create':
						this.jobs.unshift(e.record);
						break;
					case 'update':
						this.jobs = this.jobs.map((job) => (job.id === e.record.id ? e.record : job));
						break;
					case 'delete':
						this.jobs = this.jobs.filter((job) => job.id !== e.record.id);
						break;
				}
			},
			{
				filter: `user = "${this.userId}"`
			}
		);
	}

	unsubscribe() {
		if (!this.userId) return;

		pb.collection(Collections.Jobs).unsubscribe(this.userId);
	}
}

export const jobsStore = new JobsStore();
