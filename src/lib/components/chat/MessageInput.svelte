<script lang="ts">
	import { goto } from '$app/navigation';

	import { preventDefault } from '$lib/modifiers';

	let { user, thread, models, model = $bindable(), processing = $bindable() } = $props();

	import ModelSelect from './ModelSelect.svelte';

	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Toggle } from '$lib/components/ui/toggle';

	import { Send, Paperclip, Search, SearchCheck } from 'lucide-svelte';

	let text = $state('');
	let selectedModel = $derived(models.find((m) => m.id === model));
	let search = $state(false);
	let submitting = $state(false);

	async function submitPrompt(
		event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }
	) {
		submitting = true;

		const data = new FormData(event.currentTarget);
		const message = data.get('message');

		const response = await fetch('http://localhost:5173/prompt', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include',
			body: JSON.stringify({
				thread,
				model,
				message,
				search
			})
		});

		const res = await response.json();

		if (!response.ok) {
			submitting = false;
			return;
		}

		if (!thread) {
			goto(`/chat/${res.thread}`);
		}

		text = '';
		submitting = false;
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault(); // Prevents new line
			const form = event.currentTarget.closest('form');
			if (form) {
				form.dispatchEvent(new Event('submit', { cancelable: true })); // Submit the form
			}
		}
	}
</script>

<form method="POST" class="mx-auto flex max-w-3xl flex-col" onsubmit={preventDefault(submitPrompt)}>
	<div class="relative">
		<div class=" mb-2 flex justify-end">
			<ModelSelect {models} bind:selected={model} />
		</div>
		<div class="bg-background/70 backdrop-blur-md">
			<Textarea
				id="message"
				name="message"
				placeholder="Message assistant..."
				class="max-h-72 min-h-36 resize-none pr-12 pb-12"
				bind:value={text}
				disabled={submitting || processing || !model}
				onkeydown={handleKeyDown}
			/>
			<div class="absolute bottom-2 left-2">
				<div class="flex items-center space-x-1">
					<Button size="icon" variant="ghost">
						<Paperclip class="h-4 w-4" />
					</Button>
					<Toggle bind:pressed={search}
						>{#if search}<SearchCheck class="h-4 w-4" />{:else}<Search
								class="h-4 w-4"
							/>{/if}</Toggle
					>
				</div>
			</div>
			<Button
				type="submit"
				size="icon"
				disabled={submitting || processing || !model}
				class="absolute right-2 bottom-2"
			>
				<Send class="h-4 w-4" />
			</Button>
		</div>
	</div>
</form>
