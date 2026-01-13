<script lang="ts">
	import X from 'lucide-svelte/icons/x';
	import type { ClassValue } from 'svelte/elements';

	import { portal } from './portal';

	import Button from './Button.svelte';

	interface Props {
		open?: boolean;
		portalId?: string;
		class?: ClassValue;
		children?: any;
		onclose?: () => void;
		backdrop?: boolean;
		noPadding?: boolean;
		placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
		order?: number;
		transparent?: boolean;

		transition?: boolean;
		id?: string;
		fullHeight?: boolean;
	}

	let {
		open = $bindable(false),
		portalId = 'body',
		class: className = '',
		children,
		onclose,
		placement = 'center',
		backdrop = false,
		noPadding = false,
		transparent = false,
		id,
		fullHeight = false
	}: Props = $props();

	let dialogElement: HTMLDialogElement | null = $state(null);

	let placementClass = $derived.by(() => {
		switch (placement) {
			case 'top':
				return 'modal-top';
			case 'bottom':
				return 'modal-bottom';
			case 'left':
				return 'modal-start';
			case 'right':
				return 'modal-end';
			case 'center':
				return 'modal-middle';
		}
	});

	function handleClose() {
		open = false;
		dialogElement?.close();
		onclose?.();
	}

	$effect(() => {
		if (!dialogElement) return;
		if (open) {
			dialogElement.showModal();
		} else {
			handleClose();
		}
	});
</script>

<div use:portal={portalId}>
	<dialog
		{id}
		style={transparent ? 'background: transparent' : ''}
		bind:this={dialogElement}
		class={['modal', placementClass]}
	>
		<div
			class={[
				'relative modal-box',
				noPadding && 'p-0',
				fullHeight && 'flex h-full flex-col',
				className
			]}
		>
			<div class="absolute top-2 right-2 z-50">
				<Button color="neutral" variant="ghost" onclick={handleClose} circle>
					<X size={24} />
				</Button>
			</div>

			<div class={[fullHeight && 'min-h-0 flex-1', !noPadding && 'pr-2']}>
				{@render children()}
			</div>
		</div>

		{#if backdrop}
			<form method="dialog" class="modal-backdrop">
				<button onclick={handleClose}>close</button>
			</form>
		{/if}
	</dialog>
</div>
