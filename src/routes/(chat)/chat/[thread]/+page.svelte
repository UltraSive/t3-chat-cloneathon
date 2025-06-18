<script lang="ts">
	import { page } from '$app/state';

	import { useQuery } from 'convex-svelte';
	import { api } from '$convex/_generated/api.js';

	import { toast } from 'svelte-sonner';

	import MarkdownRenderer from '$lib/components/chat/MarkdownRenderer.svelte';
	import MessageInput from '$lib/components/chat/MessageInput.svelte';
	import ChatSkeleton from '$lib/components/chat/Skeleton.svelte';
	import LoadError from '$lib/components/chat/LoadError.svelte';
	import ScrollDownButton from '$lib/components/chat/ScrollDownButton.svelte';

	import { branchThread, modifyMessage } from '$lib/utils/chat';

	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { Button } from '$lib/components/ui/button';

	import { User, Bot, Copy, RotateCcw, Split, Pencil, Send } from 'lucide-svelte';

	import type { PageProps } from './$types';

	let editingMessageId: string | null = $state(null);
	let editingMessageContent: string = $state('');

	let scrollArea: HTMLDivElement | null = $state(null);
	let isAtBottom = $state(false);

	const scrollToBottom = () => {
		if (scrollArea) {
			scrollArea.scrollTop = scrollArea.scrollHeight;
		}
	};

	const checkScroll = () => {
		console.log('checking scroll');
		if (scrollArea) {
			const { scrollTop, scrollHeight, clientHeight } = scrollArea;
			isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
		}
	};

	/*$effect(() => {
    if (scrollArea) {
      scrollArea.addEventListener('scroll', checkScroll);
      checkScroll(); // Initial check
    }
    
    return () => {
      scrollArea.removeEventListener('scroll', checkScroll);
    };
  });*/

	let hoveredMessageId: string | null = $state(null);

	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			// Optionally, provide feedback to the user
			toast.success('Copied to clipboard!');
		} catch (err) {
			toast.error(`Failed to copy: ${err}`);
		}
	};

	let { data }: PageProps = $props();
	const { user, models } = data;

	let model = $state(models[0].id);

	const query = $derived(
		useQuery(api.threads.getUserThreadWithMessages, {
			thread: page.params.thread,
			user: user.id
		})
	);

	let processing = $derived.by(() => {
		return query.data?.messages?.some((m) => m.status === 'processing') ?? false;
	});

	const countQuery = $derived(
		useQuery(api.messages.getAssistantMessageCounts, {
			user: user.id,
			anchorDate: user.createdAt
		})
	);

	//let messages = $derived(query?.data?.messages);
</script>

<div class="flex h-full flex-1 flex-col">
	<ScrollArea bind:ref={scrollArea} class="flex-1 p-4">
		<div class="mx-auto max-w-3xl">
			{#if query.isLoading}
				<ChatSkeleton />
			{:else if query.error}
				<LoadError error={query.error.toString()} />
			{:else}
				{#each query.data.messages as message, i}
					{#if message.status !== 'archived'}
						{@const isUser = message.role === 'user'}
						<div
							role="group"
							onmouseenter={() => (hoveredMessageId = message._id)}
							onmouseleave={() => (hoveredMessageId = null)}
						>
							<div
								class="mb-2 flex gap-4 rounded-lg p-4"
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

								<div class="flex-1 space-y-2 overflow-hidden px-1">
									<div class="font-semibold" class:text-right={isUser}>
										{isUser ? 'You' : 'Assistant'}
									</div>
									{#if editingMessageId === message._id}
										<div>
											<textarea
												bind:value={editingMessageContent}
												rows="1"
												class="inline-block w-full resize-none rounded-md border px-2 py-1"
												onkeydown={(e) => {
													if (e.key === 'Enter' && !e.shiftKey) {
														e.preventDefault(); // Prevent new lines
														//editMessage(message._id, editingMessageContent);
													}
												}}
												placeholder="Edit your message..."
											></textarea>
											<div class="flex justify-end">
												<Button
													onclick={() => {
														modifyMessage(
															query.data.thread._id,
															message.model,
															message._id,
															editingMessageContent
														);

														editingMessageId = null;
														editingMessageContent = '';
													}}><Send /></Button
												>
											</div>
										</div>
									{:else if message.role === 'user'}
										<div class="whitespace-pre-wrap">{message.content}</div>
									{:else if message.role === 'assistant'}
										{#if message.content === '' && message.status === 'processing'}
											<Skeleton class="h-4 w-full" />
											<Skeleton class="h-4 w-3/4" />
										{:else}
											<MarkdownRenderer bind:content={message.content} />
										{/if}
									{/if}
								</div>
							</div>
							{#if message.status !== 'processing'}
								<div
									class="mb-2 space-x-0.5 px-4 transition-opacity duration-200"
									class:text-right={!isUser}
									class:opacity-100={hoveredMessageId === message._id &&
										message.status === 'finished'}
									class:opacity-0={hoveredMessageId !== message._id}
									class:pointer-events-none={hoveredMessageId !== message._id}
								>
									<Button variant="ghost" size="sm" onclick={() => copyToClipboard(message.content)}
										><Copy class="h-3 w-3" /></Button
									>
									<Button
										variant="ghost"
										size="sm"
										onclick={() =>
											modifyMessage(
												query.data.thread._id,
												message.model,
												message.role === 'assistant' ? query.data.messages[i - 1]._id : message._id,
												message.role === 'assistant'
													? query.data.messages[i - 1].content
													: message.content
											)}><RotateCcw class="h-3 w-3" /></Button
									>
									{#if !isUser}
										<Button
											variant="ghost"
											size="sm"
											onclick={() => branchThread(query.data.thread._id, message._id)}
											><Split class="h-3 w-3" /></Button
										>
									{:else}
										<Button
											variant="ghost"
											size="sm"
											onclick={() => {
												editingMessageId = message._id;
												editingMessageContent = message.content;
											}}><Pencil class="h-3 w-3" /></Button
										>
									{/if}
								</div>
							{/if}
						</div>
					{/if}
				{/each}
			{/if}
		</div>
	</ScrollArea>

	<!--<ScrollDownButton bind:isAtBottom={isAtBottom} {scrollToBottom} />-->
	<div class="sticky bottom-2 mx-4">
		<MessageInput {user} bind:model {models} thread={page.params.thread} bind:processing />
	</div>
</div>
