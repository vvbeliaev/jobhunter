<script lang="ts">
	import type { Snippet } from 'svelte';
	import { X, ChevronLeft, ChevronRight } from 'lucide-svelte';
	import type { ClassValue } from 'svelte/elements';

	interface Props {
		/** Whether the sidebar is open (mobile drawer mode) */
		open?: boolean;
		/** Whether the sidebar is expanded (desktop mode) */
		expanded?: boolean;
		/** Position of the sidebar */
		position?: 'left' | 'right';
		/** Width when expanded (desktop) */
		expandedWidth?: string;
		/** Width when collapsed (desktop) */
		collapsedWidth?: string;
		/** Width for mobile drawer */
		mobileWidth?: string;
		/** Show backdrop on mobile */
		backdrop?: boolean;
		/** Show expand/collapse toggle */
		showToggle?: boolean;
		/** Only render mobile version, skip desktop sidebar */
		mobileOnly?: boolean;
		/** Additional class for the sidebar */
		class?: ClassValue;
		/** Header content snippet */
		header?: Snippet<[{ expanded: boolean }]>;
		/** Main content snippet */
		children: Snippet<[{ expanded: boolean }]>;
		/** Footer content snippet */
		footer?: Snippet<[{ expanded: boolean }]>;
		/** Callback when sidebar should close (mobile) */
		onclose?: () => void;
		/** Callback when expand/collapse toggle is clicked */
		ontoggle?: () => void;
	}

	let {
		open = false,
		expanded = true,
		position = 'left',
		expandedWidth = 'w-64',
		collapsedWidth = 'w-16',
		mobileWidth = 'w-72',
		backdrop = true,
		showToggle = true,
		mobileOnly = false,
		class: className = '',
		header,
		children,
		footer,
		onclose,
		ontoggle
	}: Props = $props();

	const isLeft = $derived(position === 'left');
	const translateClass = $derived(
		isLeft
			? open
				? 'translate-x-0'
				: '-translate-x-full'
			: open
				? 'translate-x-0'
				: 'translate-x-full'
	);
</script>

<!-- Mobile Backdrop -->
{#if backdrop && open}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="fixed inset-0 z-40 bg-black/50 md:hidden" onclick={onclose}></div>
{/if}

<!-- Mobile Drawer -->
<aside
	class={[
		'fixed top-0 z-50 flex h-full flex-col border-base-300 bg-base-100 transition-transform duration-300 ease-in-out md:hidden',
		mobileWidth,
		isLeft ? 'left-0 border-r' : 'right-0 border-l',
		translateClass,
		className
	]}
>
	<!-- Mobile Header -->
	{#if header}
		<div
			class={[
				'flex h-12 items-center border-b border-base-300 px-4',
				isLeft ? 'justify-between' : 'flex-row-reverse justify-between'
			]}
		>
			{@render header({ expanded: true })}
			<button onclick={onclose} class="btn btn-square btn-ghost btn-sm" aria-label="Close menu">
				<X class="size-5" />
			</button>
		</div>
	{/if}

	<!-- Mobile Content -->
	<nav class="flex flex-1 flex-col overflow-y-auto">
		{@render children({ expanded: true })}
	</nav>

	<!-- Mobile Footer -->
	{#if footer}
		{@render footer({ expanded: true })}
	{/if}
</aside>

<!-- Desktop Sidebar -->
{#if !mobileOnly}
	<aside
		class={[
			'hidden flex-col border-base-300 transition-all duration-300 ease-in-out md:flex',
			isLeft ? 'border-r' : 'border-l',
			expanded ? expandedWidth : collapsedWidth,
			className
		]}
	>
		<!-- Desktop Header -->
		{#if header || showToggle}
			<div
				class={[
					'flex h-12 items-center border-b border-base-300 px-2',
					expanded ? 'justify-between' : 'justify-center'
				]}
			>
				{#if header && expanded}
					{@render header({ expanded })}
				{/if}
				{#if showToggle}
					<button onclick={ontoggle} class="btn btn-square btn-ghost" aria-label="Toggle sidebar">
						{#if isLeft}
							{#if expanded}
								<ChevronLeft class="size-6" />
							{:else}
								<ChevronRight class="size-6" />
							{/if}
						{:else if expanded}
							<ChevronRight class="size-6" />
						{:else}
							<ChevronLeft class="size-6" />
						{/if}
					</button>
				{/if}
			</div>
		{/if}

		<!-- Desktop Content -->
		<nav class="flex flex-1 flex-col overflow-y-auto">
			{@render children({ expanded })}
		</nav>

		<!-- Desktop Footer -->
		{#if footer}
			{@render footer({ expanded })}
		{/if}
	</aside>
{/if}
