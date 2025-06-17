<script lang="ts">
	import { page } from '$app/state';
	import { useQuery } from 'convex-svelte';
	import { api } from '$convex/_generated/api.js';
	import * as Sidebar from '$lib/components/ui/sidebar';

	let { user } = $props();

	const query = useQuery(api.threads.getUserPaginatedThreadsWithOldestMessage, {
		offset: 0,
		count: 25,
		user: user ? user.id : ''
	});

	// Function to truncate message content
	function truncateChars(str, maxChars) {
		return str.length > maxChars ? str.slice(0, maxChars).trimEnd() + '...' : str;
	}

	// Function to group threads by date
	function groupThreadsByDate(threads) {
		const now = new Date();

		const groups = {
			today: [],
			yesterday: [],
			Last7Days: [],
			Last30Days: [],
			older: []
		};

		threads.forEach((result) => {
			const { oldestMessage } = result;
			const messageDate = new Date(oldestMessage.createdAt); // assuming createdAt is a field in oldestMessage

			const diffTime = now.getTime() - messageDate.getTime();
			const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

			if (diffDays === 0) {
				groups.today.push(result);
			} else if (diffDays === 1) {
				groups.yesterday.push(result);
			} else if (messageDate.getTime() >= now.setDate(now.getDate() - now.getDay())) {
				groups.Last7Days.push(result);
			} else if (
				messageDate.getTime() >= new Date(now.getFullYear(), now.getMonth(), 1).getTime()
			) {
				groups.Last30Days.push(result);
			} else {
				groups.older.push(result);
			}
		});

		return groups;
	}
</script>

{#if query.isLoading}
	Loading...
{:else if query.error}
	failed to load: {query.error.toString()}
{:else}
	<Sidebar.Group>
		{@const groupedThreads = groupThreadsByDate(query.data)}
		{#each Object.entries(groupedThreads) as [dateLabel, threads]}
			{#if threads.length > 0}
				<Sidebar.GroupLabel
					>{dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)}</Sidebar.GroupLabel
				>
				<!-- Capitalize the label -->
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						{#each threads as result}
							{@const thread = result.thread}
							{@const oldestMessage = result.oldestMessage}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton isActive={thread._id === page.params.thread}>
									<a href="/chat/{thread._id}">{truncateChars(oldestMessage.content, 30)}</a>
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						{/each}
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			{/if}
		{/each}
	</Sidebar.Group>
{/if}
