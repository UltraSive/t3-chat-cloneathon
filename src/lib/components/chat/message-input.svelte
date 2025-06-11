<script lang="ts">
	import { preventDefault } from '$lib/modifiers';

	let { thread = 'j977d8pr25mcq74g49t5egatmh7hkn2m', model = 'openai/gpt-4o-mini' } = $props();

	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';

	import { Send, Paperclip } from 'lucide-svelte';

	let isLoading = $state(false);

	async function submitPrompt(
		event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }
	) {
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
			
		}
	}
</script>

<form method="POST" class="mx-auto flex max-w-3xl flex-col" onsubmit={preventDefault(submitPrompt)}>
	<div class="relative">
		<Textarea
			id="message"
			name="message"
			placeholder="Message assistant..."
			class="max-h-48 min-h-24 resize-none pr-12 pb-12"
			disabled={isLoading}
		/>
		<!--<Button
			type="submit"
			size="icon"
			disabled={isLoading}
			variant="ghost"
			class="absolute bottom-2 left-2"
		>
			<Paperclip class="h-4 w-4" />
		</Button>-->
		<Button type="submit" size="icon" disabled={isLoading} class="absolute right-2 bottom-2">
			<Send class="h-4 w-4" />
		</Button>
	</div>
</form>
