<script lang="ts">
	import { onMount } from 'svelte';

	onMount(() => {
		const theme = localStorage.getItem('theme') || 'LIGHT';
		document.documentElement.setAttribute('data-theme', theme);
	});
</script>
