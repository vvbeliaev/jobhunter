<script lang="ts">
	import { goto, invalidate } from '$app/navigation';

	import { Collections, pb } from '$lib';
	import { userStore } from '$lib/apps/user';

	interface Props {
		error?: any | null;
		loading?: boolean;
		agreed?: boolean;
	}

	let {
		error = $bindable(null),
		loading = $bindable(false),
		agreed = $bindable(true)
	}: Props = $props();

	const providers = [
		{
			label: 'google',
			name: 'Google',
			icon: '🔍'
		}
	];

	const user = $derived(userStore.user ?? null);
	const name = $derived(user?.name ?? null);
	const avatarUrl = $derived(userStore.avatarUrl ?? null);

	const onClick = async (e: MouseEvent) => {
		if (loading) return;

		loading = true;
		error = null;

		try {
			const target = e.currentTarget as HTMLElement;
			const provider = target.dataset.provider!;

			const authRes = await pb.collection(Collections.Users).authWithOAuth2({
				provider,
				query: { expand: '', requestKey: 'oauth2' },
				createData: {
					metadata: {
						provider
					}
				}
			});

			if (!name || !avatarUrl) {
				const form = new FormData();

				if (!name) {
					form.append('name', authRes.meta?.name ?? '');
				}

				if (!avatarUrl) {
					const avatarUrl = authRes.meta?.avatarUrl;
					if (avatarUrl) {
						try {
							const res = await fetch(avatarUrl);
							const blob = await res.blob();
							form.append('avatar', blob, 'avatar.jpg');
						} catch (err) {
							console.warn('Failed to fetch avatar from', avatarUrl, err);
						}
					}
				}

				await pb.collection(Collections.Users).update(authRes.record.id, form);
			}

			await goto('/');
			await invalidate('app:global');
		} catch (e: any) {
			console.error('Error during OAuth2 flow:', e);
			error = e;
		} finally {
			loading = false;
		}
	};
</script>

<div class="mb-4">
	<ul class="space-y-3">
		{#each providers as provider}
			<li>
				<button
					type="button"
					class="btn btn-block btn-outline"
					onclick={onClick}
					disabled={loading || !agreed}
					data-provider={provider.label}
				>
					{#if loading}
						<span class="loading loading-sm loading-spinner"></span>
					{/if}
					<span class="ml-2">
						{loading ? 'Connecting...' : `Continue with ${provider.name}`}
					</span>
				</button>
			</li>
		{/each}
	</ul>
</div>
