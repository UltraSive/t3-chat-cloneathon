<script lang="ts">
	import { page } from '$app/state';

  import { useQuery } from 'convex-svelte';
  import { api } from '$convex/_generated/api.js';

	import * as Sidebar from '$lib/components/ui/sidebar';

  let { user } = $props();

  const query = useQuery(api.threads.getPaginatedThreadsWithOldestMessage, {
		offset: 0,
		count: 20,
    user: user.id
	});

  function truncateChars(str, maxChars) {
		return str.length > maxChars
			? str.slice(0, maxChars).trimEnd() + "..."
			: str;
	}
</script>

<Sidebar.Group>
	<Sidebar.GroupLabel>Chats</Sidebar.GroupLabel>
	<Sidebar.GroupContent>
		{#if query.isLoading}
			Loading...
		{:else if query.error}
			failed to load: {query.error.toString()}
		{:else}
			<Sidebar.Menu>
				{#each query.data as result}
          {@const thread = result.thread}
          {@const oldestMessage = result.oldestMessage}
					<Sidebar.MenuItem>
						<Sidebar.MenuButton isActive={thread._id === page.params.thread}>
							{#snippet child({ props })}
								<a href="/chat/{thread._id}" {...props}>{truncateChars(oldestMessage.content, 30)}</a>
							{/snippet}
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>
				{/each}
			</Sidebar.Menu>
		{/if}
	</Sidebar.GroupContent>
</Sidebar.Group>
<Sidebar.Group />
