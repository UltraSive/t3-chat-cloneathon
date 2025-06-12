<script lang="ts">
	import { page } from '$app/state';

	import { useQuery } from 'convex-svelte';
	import { api } from '$convex/_generated/api.js';

	import Content from '$lib/components/chat/Content.svelte';
	import MessageInput from '$lib/components/chat/MessageInput.svelte';
	import ChatSkeleton from '$lib/components/chat/Skeleton.svelte';
	import LoadError from '$lib/components/chat/LoadError.svelte';

	import { ScrollArea } from '$lib/components/ui/scroll-area';

	import { User, Bot } from 'lucide-svelte';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const { user } = data;

	const query = $derived(
		useQuery(api.threads.getThreadWithMessages, {
			thread: page.params.thread,
			user: user.id
		})
	);

	let processing = $derived.by(() => {
		return query.data?.messages?.some((m) => m.status === 'processing') ?? false;
	});

	//let messages = $derived(query?.data?.messages);
</script>

<div class="flex h-full flex-1 flex-col">
	<ScrollArea class="flex-1 p-4">
		<div class="mx-auto max-w-3xl">
			{#if query.isLoading}
				<ChatSkeleton />
			{:else if query.error}
				<LoadError error={query.error.toString()} />
			{:else}
				{#each query.data.messages as message}
					{@const isUser = message.role === 'user'}
					<div
						class="mb-6 flex gap-4 rounded-lg p-4"
						class:flex-row-reverse={isUser}
						class:bg-muted={isUser}
					>
						<div
							class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md select-none"
							class:bg-primary={isUser}
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
		<MessageInput thread={page.params.thread} bind:processing />
	</div>
</div>
