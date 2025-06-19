<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { api } from '$convex/_generated/api.js';
	import { Dialog, DialogContent, DialogHeader, DialogTitle } from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Search, Calendar, MessageSquare } from 'lucide-svelte';
	import { goto } from '$app/navigation';

	let { open = $bindable(), user } = $props();

	let searchTerm = $state('');

	const threadsQuery = useQuery(api.threads.getUserPaginatedThreadsWithOldestMessage, {
		offset: 0,
		count: 100,
		user: user?.id || ''
	});

	function truncateChars(str, maxChars) {
		if (!str) return '';
		return str.length > maxChars ? str.slice(0, maxChars).trimEnd() + '...' : str;
	}

	function formatDate(dateString) {
		if (!dateString) return 'Unknown date';

		try {
			const date = new Date(dateString);
			const now = new Date();
			const diffTime = now.getTime() - date.getTime();
			const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

			if (diffDays === 0) return 'Today';
			if (diffDays === 1) return 'Yesterday';
			if (diffDays < 7) return `${diffDays} days ago`;
			if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
			return date.toLocaleDateString();
		} catch (error) {
			console.error('Error formatting date:', error);
			return 'Invalid date';
		}
	}

	let filteredThreads = $state([]);

	$effect(() => {
		if (threadsQuery?.isLoading) {
			filteredThreads = [];
			return;
		}

		if (threadsQuery?.error) {
			filteredThreads = [];
			return;
		}

		if (!threadsQuery?.data?.results) {
			filteredThreads = [];
			return;
		}

		const results = threadsQuery.data.results;

		if (!Array.isArray(results) || results.length === 0) {
			filteredThreads = [];
			return;
		}

		if (!searchTerm || searchTerm.trim() === '') {
			filteredThreads = results;
			return;
		}

		const filtered = results.filter((result) => {
			if (!result?.oldestMessage?.content) {
				return false;
			}

			return result.oldestMessage.content.toLowerCase().includes(searchTerm.toLowerCase());
		});

		filteredThreads = filtered;
	});

	function selectThread(threadId) {
		goto(`/chat/${threadId}`);
		open = false;
	}

	function clearSearch() {
		searchTerm = '';
	}

	// Handle keyboard shortcuts
	function handleKeydown(event) {
		if (event.key === 'Escape') {
			open = false;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<Dialog bind:open>
	<DialogContent
		class="bg-background/90 flex h-[600px] max-w-2xl flex-col overflow-hidden p-0 backdrop-blur-lg"
	>
		<div class="flex-shrink-0 border-b p-4">
			<DialogHeader>
				<DialogTitle class="mb-3 text-lg font-semibold">Search Threads</DialogTitle>
			</DialogHeader>

			<div class="relative mb-3">
				<Search
					class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform"
				/>
				<Input bind:value={searchTerm} placeholder="Search threads..." class="pl-10" autofocus />
			</div>

			{#if searchTerm}
				<div class="flex gap-2">
					<Button variant="ghost" size="sm" onclick={clearSearch}>Clear Search</Button>
				</div>
			{/if}
		</div>

		<div class="flex-1 overflow-y-auto p-4">
			{#if !user?.id}
				<div class="text-destructive py-8 text-center">
					<MessageSquare class="mx-auto mb-2 h-8 w-8" />
					No user found - unable to load threads
				</div>
			{:else if threadsQuery?.isLoading}
				<div class="text-muted-foreground py-8 text-center">
					<Search class="mx-auto mb-2 h-8 w-8 animate-spin" />
					Loading threads...
				</div>
			{:else if threadsQuery?.error}
				<div class="text-destructive py-8 text-center">
					<MessageSquare class="mx-auto mb-2 h-8 w-8" />
					Failed to load threads
				</div>
			{:else if filteredThreads.length === 0}
				<div class="text-muted-foreground py-8 text-center">
					<MessageSquare class="mx-auto mb-2 h-8 w-8" />
					{searchTerm ? 'No threads match your search criteria' : 'No threads found'}
				</div>
			{:else}
				<div class="space-y-2">
					{#each filteredThreads as result}
						{@const thread = result.thread}
						{@const oldestMessage = result.oldestMessage}
						<button
							class="hover:bg-muted w-full rounded-lg border p-3 text-left transition-colors"
							onclick={() => selectThread(thread._id)}
						>
							<div class="mb-2">
								<p class="text-sm leading-5 font-medium">
									{truncateChars(oldestMessage?.content || 'No messages', 80)}
								</p>
							</div>
							<div class="flex items-center justify-between">
								<div class="text-muted-foreground flex items-center gap-2 text-xs">
									<Calendar class="h-3 w-3" />
									{formatDate(oldestMessage?.createdAt)}
								</div>
								<Badge variant="secondary" class="text-xs">
									Thread ID: {thread._id}
								</Badge>
							</div>
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<div class="bg-muted/20 flex-shrink-0 border-t p-4">
			<div class="text-muted-foreground flex items-center justify-between text-xs">
				<span>
					{filteredThreads.length} thread{filteredThreads.length !== 1 ? 's' : ''} found
				</span>
				<span>Press <kbd class="bg-muted rounded px-1 py-0.5">Esc</kbd> to close</span>
			</div>
		</div>
	</DialogContent>
</Dialog>
