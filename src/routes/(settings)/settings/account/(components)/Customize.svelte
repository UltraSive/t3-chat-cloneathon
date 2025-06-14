<script lang="ts">
	import { toast } from 'svelte-sonner';

	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Badge } from '$lib/components/ui/badge';
	import { TagsInput } from '$lib/components/ui/tags-input';
	import * as Alert from '$lib/components/ui/alert';

	import { X, Info } from 'lucide-svelte';

	const exampleTraits = [
		'friendly',
		'witty',
		'concise',
		'curious',
		'empathetic',
		'creative',
		'patient'
	];

	import type { SuperValidated, Infer } from 'sveltekit-superforms';
	import { superForm } from 'sveltekit-superforms';
	import SuperDebug from 'sveltekit-superforms';
	import type { CustomizeSchema } from '$lib/schemas/customize';

	let { data }: { data: SuperValidated<Infer<CustomizeSchema>> } = $props();

	let { form, constraints, errors, enhance, message } = superForm(data, {
		dataType: 'json',
		onSubmit: () => {
			toast.loading('Attempting login...');
		}
	});
</script>

<form method="POST" use:enhance>
	<Card.Root>
		<Card.Header>
			<Card.Title>Customize Chat Experience</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-6">
			<!--<SuperDebug data={$form} />-->
			{#if $message}
				<Alert.Root>
					<Info class="h-4 w-4" />
					<Alert.Title>{$message}</Alert.Title>
				</Alert.Root>
			{/if}
			<div class="space-y-2">
				<Label for="nickname">What should the assistant call you?</Label>
				<div class="relative">
					<Input
						id="nickname"
						name="nickname"
						placeholder="Enter your name"
						class="pr-12"
						aria-invalid={$errors.nickname ? 'true' : undefined}
						bind:value={$form.nickname}
						{...$constraints.nickname}
					/>
					<span class="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 text-xs">
						{$form.nickname?.length}/50
					</span>
				</div>
			</div>

			<div class="space-y-2">
				<Label for="occupation">What do you do?</Label>
				<div class="relative">
					<Input
						id="occupation"
						name="occupation"
						placeholder="Engineer, student, etc."
						class="pr-16"
						aria-invalid={$errors.occupation ? 'true' : undefined}
						bind:value={$form.occupation}
						{...$constraints.occupation}
					/>
					<span class="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 text-xs">
						{$form.occupation?.length}/100
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
						name="traits"
						placeholder="Type a trait and press Enter or Tab..."
						class="pr-12"
						aria-invalid={$errors.traits ? 'true' : undefined}
						bind:value={$form.traits}
						{...$constraints.traits}
					/>
					<span class="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 text-xs">
						{$form.traits?.length}/50
					</span>
				</div>
				<div class="flex flex-wrap gap-2">
					{#each exampleTraits as trait}
						<button type="button" onclick={() => $form.traits?.push(trait)}>
							<Badge variant="secondary" class="flex items-center gap-1">
								{trait}
								<Button variant="ghost" size="sm" class="h-4 w-4 p-0 hover:bg-transparent">
									<X class="h-3 w-3" />
								</Button>
							</Badge>
						</button>
					{/each}
				</div>
			</div>

			<div class="space-y-2">
				<Label for="additionalInfo">Anything else the assistant should know about you?</Label>
				<div class="relative">
					<Textarea
						id="additionalInfo"
						name="additionalInfo"
						placeholder="Interests, values, or preferences to keep in mind"
						rows={4}
						class="resize-none"
            aria-invalid={$errors.additionalInfo ? 'true' : undefined}
						bind:value={$form.additionalInfo}
						{...$constraints.additionalInfo}
					/>
					<span class="text-muted-foreground absolute right-3 bottom-3 text-xs">{$form.additionalInfo?.length}/3000</span>
				</div>
			</div>

			<div class="flex justify-end">
				<Button>Save Preferences</Button>
			</div>
		</Card.Content>
	</Card.Root>
</form>
