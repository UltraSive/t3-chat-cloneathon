<script lang="ts">
  import Customize from "./(components)/Customize.svelte";

	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';

	import { Rocket, Gauge, HeadsetIcon } from 'lucide-svelte';

	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
	const { user } = data;
</script>

<div class="space-y-6">
	<div>
		<h2 class="mb-6 text-2xl font-bold">
			{#if user.stripeSubscriptionId}Pro Plan Benefits
			{:else}Upgrade to Pro{/if}
		</h2>
		<div class="grid gap-4 md:grid-cols-3">
			<Card.Root>
				<Card.Header class="pb-2">
					<Card.Title class="flex items-center gap-2">
						<Rocket class="text-primary h-5 w-5" />
						Access to All Models
					</Card.Title>
				</Card.Header>
				<Card.Content>
					<p class="text-sm">
						Get access to our full suite of models including Claude, O3-mini-high, and more!
					</p>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header class="pb-2">
					<Card.Title class="flex items-center gap-2">
						<Gauge class="text-primary h-5 w-5" />
						Generous Limits
					</Card.Title>
				</Card.Header>
				<Card.Content>
					<p class="text-sm">
						Receive 1500 standard credits per month, plus 100 premium credits* per month.
					</p>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header class="pb-2">
					<Card.Title class="flex items-center gap-2">
						<HeadsetIcon class="text-primary h-5 w-5" />
						Priority Support
					</Card.Title>
				</Card.Header>
				<Card.Content>
					<p class="text-sm">
						Get faster responses and dedicated assistance from the T3 team whenever you need help!
					</p>
				</Card.Content>
			</Card.Root>
		</div>

		<div class="mt-6 flex items-center justify-between">
			{#if user.stripeSubscriptionId}
				<Button href="/manage" class="px-8">Manage Subscription</Button>
			{:else}
				<Button href="/upgrade" class="px-8">Upgrade Now</Button>
				<div class="text-xl font-bold">
					$8<span class="text-muted-foreground text-sm font-normal">/month</span>
				</div>
			{/if}
		</div>

		<p class="text-muted-foreground mt-4 text-xs">
			*Premium credits are used for image generation and more expensive models, currently they are
			not available.
		</p>
	</div>
	<Customize data={data.form} traits={user.traits ? user.traits : []} />
</div>
