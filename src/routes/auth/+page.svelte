<script lang="ts">
	import { goto, invalidate } from '$app/navigation';

	import { Button, Collections, Input, pb, ThemeController } from '$lib';
	import { userStore } from '$lib/apps/user';

	import Oauth from './Oauth.svelte';

	let loading = $state(false);
	let error: string | null = $state(null);

	let email = $state('');
	let password = $state('');

	async function handleLogin(e: SubmitEvent) {
		e.preventDefault();
		loading = true;
		error = null;

		try {
			pb.authStore.clear();
			const res = await pb.collection(Collections.Users).authWithPassword(email, password);
			userStore.set(res);
			await invalidate('app:global');
			goto('/');
		} catch (err: any) {
			console.error(err);
			error = err.message || 'Failed to login';
		} finally {
			loading = false;
		}
	}
</script>

<div class="mx-auto mt-8 max-w-lg px-4 pb-12">
	<div class="sm:hidden">
		<ThemeController />
	</div>

	<h1 class="mb-6 text-center text-3xl font-bold">Nice to meet you!</h1>

	<div class="mb-4">
		<Oauth bind:loading bind:error />
	</div>

	<div class="divider my-8">OR</div>

	<form
		onsubmit={handleLogin}
		class="flex flex-col gap-4 rounded-xl border border-base-300 p-6 shadow-sm"
	>
		<Input
			label="Email"
			type="email"
			placeholder="your@email.com"
			bind:value={email}
			required
			disabled={loading}
		/>

		<Input
			label="Password"
			type="password"
			placeholder="••••••••"
			bind:value={password}
			required
			disabled={loading}
		/>

		{#if error}
			<div class="alert text-sm alert-error">
				<span>{error}</span>
			</div>
		{/if}

		<Button
			variant={email && password ? 'solid' : 'ghost'}
			color="primary"
			type="submit"
			block
			{loading}
			disabled={loading}>Log In</Button
		>
	</form>
</div>
