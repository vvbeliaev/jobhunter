import type { AuthRecord } from 'pocketbase';

import { userStore } from '$lib/apps/user';
import { pb, setPBCookie, type UsersResponse } from '$lib';

pb.authStore.onChange((token: string, record: AuthRecord) => {
	if (record && pb!.authStore.isValid) {
		try {
			const user = record as UsersResponse;
			userStore.set({ record: user, token });

			setPBCookie();
		} catch (error) {
			console.error('Failed to parse user data:', error);
		}
	} else {
		userStore.clear();
	}
}, false);
