<script lang="ts">
	import { goto } from '$app/navigation';

	import { preventDefault } from '$lib/modifiers';

	let { thread, models, model = $bindable(), processing = $bindable() } = $props();

	import ModelSelect from './ModelSelect.svelte';

	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';

	import { Send, Paperclip } from 'lucide-svelte';

	let text = $state('');
	let selectedModel = $derived(models.find((m) => m.id === model));
	let tool = $state(undefined);
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
				message
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
			<ModelSelect {models} bind:selected={model} />
			{#if selectedModel.tools}
				{#if selectedModel.tools.length > 0}
					<ModelSelect bind:tools={selectedModel.tools} bind:selected={tool} />
				{/if}
			{/if}
		</div>
		<!--<Button
			type="submit"
			size="icon"
			disabled={isLoading}
			variant="ghost"
			class="absolute bottom-2 left-2"
		>
			<Paperclip class="h-4 w-4" />
		</Button>-->
		<Button
			type="submit"
			size="icon"
			disabled={submitting || processing || !model}
			class="absolute right-2 bottom-2"
		>
			<Send class="h-4 w-4" />
		</Button>
	</div>
</form>
