<script lang="ts">
	import { Lock } from 'lucide-svelte';

	import { userStore } from '$lib/apps/user';

	import { uiStore } from './ui.svelte';

	const user = $derived(userStore.user);

	function sendVerificationEmail() {
		uiStore.setEmailVerifyWallOpen(false);
	}

	$effect(() => {
		if (user?.verified) {
			uiStore.setEmailVerifyWallOpen(false);
		}
	});
	$effect(() => {
		if (user && !user.verified && uiStore.emailVerifyWallOpen) {
			sendVerificationEmail();
		}
	});
</script>

<div class="flex flex-col items-center gap-4 p-6 text-center">
	<div class="rounded-full bg-base-200 p-4">
		<Lock class="size-8 text-primary" />
	</div>
</div>
