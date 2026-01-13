<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	interface Props extends HTMLTextareaAttributes {
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
		ghost: 'textarea-ghost',
		soft: 'textarea-soft',
		outline: '', // default
		dash: 'textarea-dash'
	};

	const colorClasses = {
		primary: 'textarea-primary',
		secondary: 'textarea-secondary',
		accent: 'textarea-accent',
		info: 'textarea-info',
		success: 'textarea-success',
		warning: 'textarea-warning',
		error: 'textarea-error',
		neutral: 'textarea-neutral'
	};

	const sizeClasses = {
		xs: 'textarea-xs',
		sm: 'textarea-sm',
		md: 'textarea-md',
		lg: 'textarea-lg',
		xl: 'textarea-xl'
	};
</script>

<label class={['form-control w-full', containerClass]}>
	{#if label}
		<div class="label">
			<span class="label-text font-medium">{label}</span>
		</div>
	{/if}

	<textarea
		bind:value
		class={[
			'textarea min-h-[100px] w-full',
			variantClasses[variant],
			color && colorClasses[color],
			sizeClasses[size],
			error && 'textarea-error',
			className
		]}
		{...rest}
	></textarea>

	{#if error}
		<div class="label">
			<span class="label-text-alt text-error">{error}</span>
		</div>
	{/if}
</label>
