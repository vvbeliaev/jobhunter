<script lang="ts">
	import { goto } from '$app/navigation';
	import { Lock } from 'lucide-svelte';
	import { Button } from '$lib/shared/ui';
	import { uiStore } from './ui.svelte';

	function handleSignUp() {
		uiStore.setAuthWallOpen(false);
		goto('/auth');
	}
</script>

<div class="flex flex-col items-center gap-4 p-6 text-center">
	<div class="rounded-full bg-base-200 p-4">
		<Lock class="size-8 text-primary" />
	</div>

	<div class="space-y-2">
		<h3 class="text-xl font-bold">Account Required</h3>
		<p class="max-w-xs text-base-content/70">
			Please sign up or log in to continue using this feature.
		</p>
	</div>

	<div class="flex w-full flex-col gap-2 sm:flex-row">
		<Button variant="solid" color="primary" class="w-full" onclick={handleSignUp}
			>Sign Up / Log In</Button
		>
	</div>
</div>
