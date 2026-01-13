<script lang="ts">
	import { GraduationCap } from 'lucide-svelte';
	import type { ClassValue } from 'svelte/elements';

	interface Props {
		size?: number;
		class?: ClassValue;
		text?: string;
	}

	const { size = 24, class: className = '', text = 'PUBLIC_ENV' }: Props = $props();
</script>

<div class="flex size-9 items-center justify-center rounded-xl bg-primary text-white">
	<GraduationCap {size} />
</div>
<span class="font-display text-xl font-bold tracking-tight text-nowrap">{text}</span>
