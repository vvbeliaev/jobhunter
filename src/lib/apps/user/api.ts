import { Collections, pb, type UsersRecord } from '$lib/shared/pb';

class UserAPI {
	async updateProfile(data: Partial<UsersRecord> | FormData) {
		const userId = pb.authStore.record?.id;
		if (!userId) throw new Error('User not authenticated');

		return await pb.collection(Collections.Users).update(userId, data);
	}

	async submitMentorApplication(data: Partial<UsersRecord>) {
		const userId = pb.authStore.record?.id;
		if (!userId) throw new Error('User not authenticated');
		// Set isMentor to true but keep isVerified false (requires admin manual verification)
		return await pb.collection(Collections.Users).update(userId, {
			...data,
			isMentor: true
		});
	}
}

export const userApi = new UserAPI();
