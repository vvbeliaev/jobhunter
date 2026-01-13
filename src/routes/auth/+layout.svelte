<script lang="ts">
	import { goto } from '$app/navigation';

	import { userStore } from '$lib/apps/user';

	$effect(() => {
		const user = userStore.user;
		if (user && user.verified) {
			goto('/', { replaceState: true });
		}
	});

	let { children } = $props();
</script>

<div class="mx-auto w-full max-w-7xl space-y-4 overflow-y-auto pb-6 sm:pb-0">
	{@render children()}
</div>
