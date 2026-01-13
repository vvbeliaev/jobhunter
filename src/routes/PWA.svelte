<script lang="ts">
	import { onMount } from 'svelte';

	//@ts-ignore
	import { registerSW } from 'virtual:pwa-register';
	//@ts-ignore
	import { pwaInfo } from 'virtual:pwa-info';

	onMount(() => {
		const updateSW = registerSW({
			immediate: true,
			onRegisteredSW(url: string, reg: ServiceWorkerRegistration) {
				console.log('[PWA] registered:', url, reg);
			},
			onRegisterError(err: Error) {
				console.error('[PWA] register error:', err);
			},
			onNeedRefresh() {
				console.log('[PWA] need refresh');
			},
			onOfflineReady() {
				console.log('[PWA] offline ready');
			}
		});
	});

	const webManifestLink = $derived(pwaInfo ? pwaInfo.webManifest.linkTag : '');
</script>

<svelte:head>
	{@html webManifestLink}
</svelte:head>
