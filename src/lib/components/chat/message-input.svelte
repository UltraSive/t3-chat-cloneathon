<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';

	import { Send, Paperclip } from 'lucide-svelte';

	let isLoading = $state(false);
</script>

<form class="mx-auto flex max-w-3xl flex-col">
	<div class="relative">
		<Textarea
			id="message"
			name="message"
			placeholder="Message assistant..."
			class="max-h-48 min-h-24 resize-none pr-12 pb-12"
			disabled={isLoading}
		/>
		<Button
			type="submit"
			size="icon"
			disabled={isLoading}
			variant="ghost"
			class="absolute bottom-2 left-2"
		>
			<Paperclip class="h-4 w-4" />
		</Button>
		<Button type="submit" size="icon" disabled={isLoading} class="absolute right-2 bottom-2">
			<Send class="h-4 w-4" />
		</Button>
	</div>
</form>
