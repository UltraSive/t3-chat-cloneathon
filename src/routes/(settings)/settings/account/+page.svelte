<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Badge } from '$lib/components/ui/badge';
	import { TagsInput } from '$lib/components/ui/tags-input';

	import { Rocket, Gauge, HeadsetIcon, X } from 'lucide-svelte';

	const exampleTraits = [
		'friendly',
		'witty',
		'concise',
		'curious',
		'empathetic',
		'creative',
		'patient'
	];

	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
	const { user } = data;

  let name = $state({user.name})
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
	<Card.Root>
		<Card.Header>
			<Card.Title>Customize Chat Experience</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-6">
			<div class="space-y-2">
				<Label for="chat-name">What should the assistant call you?</Label>
				<div class="relative">
					<Input id="chat-name" placeholder="Enter your name" maxlength={50} class="pr-12" />
					<span class="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 text-xs">
						0/50
					</span>
				</div>
			</div>

			<div class="space-y-2">
				<Label for="occupation">What do you do?</Label>
				<div class="relative">
					<Input
						id="occupation"
						placeholder="Engineer, student, etc."
						maxlength={100}
						class="pr-16"
					/>
					<span class="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 text-xs">
						0/100
					</span>
				</div>
			</div>

			<div class="space-y-3">
				<div>
					<Label for="traits">What traits should the assistant have?</Label>
					<p class="text-muted-foreground text-xs">(up to 50, max 100 chars each)</p>
				</div>
				<div class="relative">
					<TagsInput
						id="traits"
						placeholder="Type a trait and press Enter or Tab..."
						max={50}
						maxlength={100}
						class="pr-12"
					/>
					<span class="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 text-xs">
						0/50
					</span>
				</div>
				<div class="flex flex-wrap gap-2">
					{#each exampleTraits as trait}
						<Badge variant="secondary" class="flex items-center gap-1">
							{trait}
							<Button variant="ghost" size="sm" class="h-4 w-4 p-0 hover:bg-transparent">
								<X class="h-3 w-3" />
							</Button>
						</Badge>
					{/each}
				</div>
			</div>

			<div class="space-y-2">
				<Label for="additional-info">Anything else the assistant should know about you?</Label>
				<div class="relative">
					<Textarea
						id="additional-info"
						placeholder="Interests, values, or preferences to keep in mind"
						maxlength={3000}
						rows={4}
						class="resize-none"
					/>
					<span class="text-muted-foreground absolute right-3 bottom-3 text-xs">0/3000</span>
				</div>
			</div>

			<div class="flex justify-end">
				<Button>Save Preferences</Button>
			</div>
		</Card.Content>
	</Card.Root>
</div>
