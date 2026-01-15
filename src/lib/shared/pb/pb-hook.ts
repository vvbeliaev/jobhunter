import type { AuthRecord } from 'pocketbase';

import { userStore } from '$lib/apps/user';
import { jobsStore } from '$lib/apps/job';
import { pb, setPBCookie, type UsersResponse } from '$lib';

pb.authStore.onChange((token: string, record: AuthRecord) => {
	if (record && pb!.authStore.isValid) {
		try {
			const user = record as UsersResponse;
			userStore.set({ record: user, token });

			setPBCookie();
		} catch (error) {
			userStore.clear();
			jobsStore.clear();
			console.error('Failed to parse user data:', error);
		}
	} else {
		userStore.clear();
		jobsStore.clear();
	}
}, false);
