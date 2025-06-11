<script lang="ts">
	import { fade } from 'svelte/transition';

	import { PUBLIC_CONVEX_URL } from '$env/static/public';
	import { setupConvex } from 'convex-svelte';

	import * as Sidebar from '$lib/components/ui/sidebar';
	import { Button } from '$lib/components/ui/button';

	import AppSidebar from '$lib/components/chat/sidebar/nav.svelte';

	import { SquarePen } from 'lucide-svelte';

	const { children } = $props();
	setupConvex(PUBLIC_CONVEX_URL);

	let sidebarOpen = $state(true);
</script>

<Sidebar.Provider bind:open={sidebarOpen}>
	<AppSidebar />
	{#if !sidebarOpen}
		<div class="absolute top-1 left-1 z-50" in:fade={{ delay: 250 }} out:fade={{ duration: 50 }}>
			<div class="bg-muted/50 rounded p-1">
				<Sidebar.Trigger />
				<Button size="icon" variant="ghost" class="size-7" href="/"><SquarePen /></Button>
			</div>
		</div>
	{/if}
	<main class="w-full">
		{@render children?.()}
	</main>
</Sidebar.Provider>
