<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { api } from '../convex/_generated/api.js';

	const query = useQuery(api.threads.getPaginatedThreadsWithOldestMessage, {offset: 0, count: 10});
</script>

{#if query.isLoading}
	Loading...
{:else if query.error}
	failed to load: {query.error.toString()}
{:else}
	<ul>
		{#each query.data as thread}
			{thread.name}
		{/each}
	</ul>
{/if}