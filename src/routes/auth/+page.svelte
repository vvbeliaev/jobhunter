<script lang="ts">
	import { ThemeController } from '$lib';

	import Oauth from './Oauth.svelte';

	let loading = $state(false);
	let error: any | null = $state(null);
</script>

<div class="mx-auto mt-8 max-w-lg px-4">
	<div class="sm:hidden">
		<ThemeController />
	</div>

	<h1 class="mb-6 text-center text-3xl font-bold">Nice to meet you!</h1>

	<div class="mb-4">
		<Oauth bind:loading bind:error />
	</div>
</div>
