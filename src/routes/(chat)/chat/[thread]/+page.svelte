<script lang="ts">
	import { page } from '$app/state';

	import { useQuery } from 'convex-svelte';
	import { api } from '$convex/_generated/api.js';
	import type { Id } from '$convex/_generated/dataModel';

	import Content from '$lib/components/chat/content.svelte';
	import MessageInput from '$lib/components/chat/message-input.svelte';

	import { ScrollArea } from '$lib/components/ui/scroll-area';

	import { User, Bot } from 'lucide-svelte';

	import type { PageProps } from '../[id]/$types';
	let { data }: PageProps = $props();
	const { user } = data;

	const threadId = page.params.thread as Id<'threads'>;

	const query = useQuery(api.threads.getThreadWithMessages, {
		threadId,
		userId: user.id
	});
</script>

<div class="flex h-full flex-1 flex-col">
	<ScrollArea class="flex-1 p-4">
		<div class="mx-auto max-w-3xl">
			{#if query.isLoading}
				Loading...
			{:else if query.error}
				failed to load: {query.error.toString()}
			{:else}
				{#each query.data.messages as message}
					{@const isUser = message.role === 'user'}
					<div class="p-4 mb-6 flex gap-4 rounded-lg" class:flex-row-reverse={isUser} class:bg-muted={isUser}>
						<div
							class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md select-none"
							class:bg-green-600={isUser}
							class:bg-muted={!isUser}
						>
							{#if isUser}
								<User class="h-4 w-4 text-white" />
							{:else}
								<Bot class="text-foreground h-4 w-4" />
							{/if}
						</div>

						<div class="flex-1 space-y-2 overflow-hidden px-1" class:text-right={isUser}>
							<div class="font-semibold">{isUser ? 'You' : 'Assistant'}</div>
							<Content bind:content={message.content} />
						</div>
					</div>
				{/each}
			{/if}
		</div>
	</ScrollArea>
	<div class="bg-background/70 sticky bottom-2 mx-4 backdrop-blur-md">
		<MessageInput />
	</div>
</div>
