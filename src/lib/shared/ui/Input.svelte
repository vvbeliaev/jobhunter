<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLInputAttributes, 'size'> {
		label?: string;
		error?: string;
		containerClass?: string;
		variant?: 'ghost' | 'soft' | 'outline' | 'dash';
		color?:
			| 'primary'
			| 'secondary'
			| 'accent'
			| 'info'
			| 'success'
			| 'warning'
			| 'error'
			| 'neutral';
		size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
	}

	let {
		label,
		error,
		containerClass = '',
		variant = 'outline',
		color,
		size = 'md',
		value = $bindable(),
		class: className = '',
		...rest
	}: Props = $props();

	const variantClasses = {
		ghost: 'input-ghost',
		soft: 'input-soft',
		outline: '', // default
		dash: 'input-dash'
	};

	const colorClasses = {
		primary: 'input-primary',
		secondary: 'input-secondary',
		accent: 'input-accent',
		info: 'input-info',
		success: 'input-success',
		warning: 'input-warning',
		error: 'input-error',
		neutral: 'input-neutral'
	};

	const sizeClasses = {
		xs: 'input-xs',
		sm: 'input-sm',
		md: 'input-md',
		lg: 'input-lg',
		xl: 'input-xl'
	};
</script>

<label class={['form-control w-full', containerClass]}>
	{#if label}
		<div class="label">
			<span class="label-text font-medium">{label}</span>
		</div>
	{/if}

	<input
		bind:value
		class={[
			'input w-full',
			variantClasses[variant],
			color && colorClasses[color],
			sizeClasses[size],
			error && 'input-error',
			className
		]}
		{...rest}
	/>

	{#if error}
		<div class="label">
			<span class="label-text-alt text-error">{error}</span>
		</div>
	{/if}
</label>
