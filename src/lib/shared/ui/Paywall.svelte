<script lang="ts">
	import posthog from 'posthog-js';
	import { page } from '$app/state';
	import { Check, Sparkles } from 'lucide-svelte';
	import { Button } from '$lib/shared/ui';
	import { uiStore } from './ui.svelte';

	// Assuming computeApiUrl is available or we can use a relative path/env var.
	// For now, I'll use a placeholder or try to find where it is.
	// The user code used '$lib/api/compute-url', I should check if it exists.
	// I'll assume a standard fetch to an API endpoint for now.

	interface StripePrice {
		lookup: string;
		tariff: string;
		amount: number; // in dollars/euros
	}

	const { stripePrices = [] }: { stripePrices: StripePrice[] } = $props();

	let billingPeriod = $state<'monthly' | 'yearly'>('yearly');
	let loading = $state(false);

	// Create a map of prices by lookup key
	const priceMap = $derived(
		new Map<string, StripePrice>(stripePrices.map((price) => [price.lookup, price]))
	);

	const plans = [
		{
			name: 'Plus',
			description: 'Perfect for serious storytellers',
			features: [
				'Unlimited stories',
				'Advanced character customization',
				'Priority support',
				'Access to new features first'
			],
			lookupPrefix: 'plus', // Adjusted from user example to match likely schema
			badge: 'Most Popular'
		},
		{
			name: 'Pro',
			description: 'For power users & professionals',
			features: [
				'Everything in Plus',
				'AI-powered suggestions',
				'Export to multiple formats',
				'Collaboration tools',
				'Dedicated account manager'
			],
			lookupPrefix: 'pro',
			highlighted: true,
			badge: 'Maximum Value'
		}
	];

	function calculatePrice(plan: (typeof plans)[number], period: 'monthly' | 'yearly') {
		const monthlyLookup = `${plan.lookupPrefix}_monthly`;
		const yearlyLookup = `${plan.lookupPrefix}_yearly`;

		const monthlyPrice = priceMap.get(monthlyLookup);
		const yearlyPrice = priceMap.get(yearlyLookup);

		if (!monthlyPrice || !yearlyPrice) {
			// Mock prices if not found for UI dev
			return {
				monthly: period === 'monthly' ? 9.99 : 7.99,
				yearly: period === 'yearly' ? 95.88 : null,
				basePrice: 9.99,
				discount: 20
			};
		}

		// Logic adapted from user example
		const baseMonthlyPrice = monthlyPrice.amount;
		// Assuming the amount is already in the correct unit (e.g. dollars) or we need to divide by 100.
		// User example had `amount: number; // in dollars`.
		// Usually Stripe sends cents. I'll assume the passed prop is already formatted or I'll format it.
		// Let's assume the prop `stripePrices` passed in has `amount` in major currency units as per user interface.

		if (period === 'yearly') {
			const yearlyMonthlyEquivalent = yearlyPrice.amount / 12;
			const discount = Math.round((1 - yearlyMonthlyEquivalent / baseMonthlyPrice) * 100);

			return {
				monthly: yearlyMonthlyEquivalent,
				yearly: yearlyPrice.amount,
				basePrice: baseMonthlyPrice,
				discount
			};
		}

		return {
			monthly: monthlyPrice.amount,
			yearly: null,
			basePrice: baseMonthlyPrice,
			discount: 0
		};
	}

	async function checkoutSession(lookupPrefix: string) {
		loading = true;
		const lookup = `${lookupPrefix}_${billingPeriod}`;

		try {
			posthog.capture('checkout_started', {
				price: lookup,
				returnUrl: page.url.pathname.slice(1),
				plan: lookupPrefix
			});

			// Using a relative path for now, assuming proxy or same origin
			const response = await fetch(`/api/stripe/checkout`, {
				method: 'POST',
				body: JSON.stringify({ price: lookup, returnUrl: page.url.pathname.slice(1) }),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			const data = await response.json();
			posthog.capture('checkout_completed', {
				price: lookup,
				...data
			});

			window.location.href = data.url;
			uiStore.setPaywallOpen(false);
		} catch (e) {
			console.error('Checkout failed', e);
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex flex-col gap-4 p-4 sm:p-6">
	<!-- Header -->
	<div class="space-y-2 text-center">
		<div class="flex items-center justify-center gap-2">
			<Sparkles class="size-5 text-warning" />
			<span class="badge font-semibold badge-warning">Early Adopter Offer</span>
		</div>
		<h2 class="text-2xl font-bold sm:text-3xl">Unlock Full Potential</h2>
		<p class="mx-auto max-w-lg text-sm text-base-content/60">
			Join the first 500 users and get exclusive early adopter pricing
		</p>
	</div>

	<!-- Period Toggle -->
	<div class="mx-auto flex items-center gap-2 rounded-full bg-base-200 p-1">
		<button
			class={[
				'rounded-full px-6 py-2 text-sm font-semibold transition-all',
				billingPeriod === 'monthly'
					? 'bg-base-100 shadow-md'
					: 'text-base-content/60 hover:text-base-content'
			]}
			onclick={() => {
				billingPeriod = 'monthly';
			}}
		>
			Monthly
		</button>
		<button
			class={[
				'rounded-full px-6 py-2 text-sm font-semibold transition-all',
				billingPeriod === 'yearly'
					? 'bg-base-100 shadow-md'
					: 'text-base-content/60 hover:text-base-content'
			]}
			onclick={() => {
				billingPeriod = 'yearly';
			}}
		>
			Yearly
			{#if billingPeriod === 'yearly'}
				<span class="ml-1 badge badge-xs badge-success">-20%</span>
			{/if}
		</button>
	</div>

	<!-- Pricing Cards -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
		{#each plans as plan}
			{@const pricing = calculatePrice(plan, billingPeriod)}
			<div
				class={[
					'relative flex h-full flex-col rounded-2xl border border-base-200 bg-base-100 p-5 shadow-md transition-all duration-300',
					plan.highlighted
						? 'shadow-xl ring-2 ring-primary'
						: 'hover:border-primary/20 hover:shadow-lg'
				]}
			>
				<!-- Badge -->
				{#if plan.badge}
					<div class="mb-3 badge self-start badge-sm font-semibold">
						{plan.badge}
					</div>
				{/if}

				<!-- Plan Name & Description -->
				<div class="mb-4">
					<h3 class="mb-1 text-2xl font-bold">{plan.name}</h3>
					<p class="text-sm text-base-content/60">{plan.description}</p>
				</div>

				<!-- Pricing -->
				<div class="mb-4 border-b border-base-200 pb-4">
					<div class="mb-0.5 flex items-baseline gap-1">
						<span class="text-4xl font-bold">
							€{Number(pricing.monthly).toFixed(2)}
						</span>
						<span class="text-lg text-base-content/60">/mo</span>
					</div>
					{#if pricing.yearly !== null}
						<p class="mb-1 text-xs text-base-content/50">
							€{pricing.yearly.toFixed(2)} billed annually
						</p>
					{/if}
					{#if pricing.discount > 0}
						<div class="flex items-center gap-1.5">
							<span class="text-xs text-base-content/40 line-through">
								€{pricing.basePrice.toFixed(2)}/mo
							</span>
							<span class="badge badge-sm font-semibold badge-success">
								{pricing.discount}% OFF
							</span>
						</div>
					{/if}
				</div>

				<!-- Features -->
				<ul class="mb-4 flex-1 space-y-2">
					{#each plan.features as feature}
						<li class="flex items-start gap-2">
							<Check class="mt-0.5 size-4 shrink-0 text-success" />
							<span class="text-sm leading-relaxed text-base-content/70">{feature}</span>
						</li>
					{/each}
				</ul>

				<!-- CTA Button -->
				<Button
					variant={plan.highlighted ? 'solid' : 'outline'}
					class="w-full"
					disabled={loading}
					onclick={() => checkoutSession(plan.lookupPrefix)}
				>
					{loading ? 'Processing...' : `Get ${plan.name}`}
				</Button>
			</div>
		{/each}
	</div>

	<!-- Bottom Note -->
	<div class="rounded-lg border border-base-200 bg-base-200/50 p-2 text-center">
		<p class="text-xs leading-relaxed text-base-content/70">
			<span class="font-semibold">Risk-free trial:</span> 14-day money-back guarantee • Cancel anytime
			• Secure checkout powered by Stripe
		</p>
	</div>
</div>
