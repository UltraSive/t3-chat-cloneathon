<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { api } from '../../../../convex/_generated/api.js';

	import Content from '$lib/components/chat/content.svelte';
	import MessageInput from '$lib/components/chat/message-input.svelte';

	import { ScrollArea } from '$lib/components/ui/scroll-area';

	import { User, Bot, Send, Paperclip } from 'lucide-svelte';

	const query = useQuery(api.threads.getPaginatedThreadsWithOldestMessage, {
		offset: 0,
		count: 10
	});

	const messages = [
		{ id: '1', role: 'system', content: 'Hello! How can I help you today?' },
		{ id: '2', role: 'user', content: "I'm trying to learn about Next.js. Can you help me?" },
		{
			id: '3',
			role: 'system',
			content:
				"Next.js is a React framework that enables server-side rendering and generating static websites. It's a great choice for building modern web applications. What specific aspects would you like to know about?"
		},
		{
			id: '4',
			role: 'user',
			content: 'What are the main benefits of using Next.js compared to plain React?'
		},
		{
			id: '5',
			role: 'system',
			content:
				'Great question! Next.js offers several advantages over plain React:\n\n1. **Server-Side Rendering (SSR)**: Improves performance and SEO by rendering pages on the server.\n\n2. **Static Site Generation (SSG)**: Pre-renders pages at build time for even better performance.\n\n3. **File-based Routing**: Simplifies route creation based on your file structure.\n\n4. **API Routes**: Allows you to build API endpoints as part of your Next.js app.\n\n5. **Built-in Image Optimization**: Automatically optimizes images for better performance.\n\n6. **Automatic Code Splitting**: Loads only the JavaScript needed for each page.\n\n7. **Built-in CSS and Sass Support**: Makes styling your application easier.\n\nWould you like me to elaborate on any of these features?'
		}
	];
</script>

<div class="flex h-full flex-1 flex-col">
	<ScrollArea class="flex-1 p-4">
		<div class="mx-auto max-w-3xl">
			{#each messages as message}
				{@const isUser = message.role === 'user'}
				<div class="mb-6 flex gap-4" class:flex-row-reverse={isUser}>
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
						<Content content={message.content} />
					</div>
				</div>
			{/each}
		</div>
	</ScrollArea>
	<MessageInput />
</div>
