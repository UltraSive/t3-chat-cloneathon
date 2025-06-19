<script lang="ts">
	import { PUBLIC_CONVEX_URL } from '$env/static/public';
	import { setupConvex } from 'convex-svelte';

	import * as Sidebar from '$lib/components/ui/sidebar';
	import { Button } from '$lib/components/ui/button';

	import AppSidebar from '$lib/components/chat/sidebar/nav.svelte';
	import ModelSelect from '$lib/components/chat/ModelSelect.svelte';
	import ThreadSearchModal from '$lib/components/chat/sidebar/nav-modal-search.svelte'; // Import the search modal

	import { SquarePen, Plus, Search } from 'lucide-svelte';

	import { getModel, setModel } from '$lib/components/chat/settings.svelte';
	import { page } from '$app/stores'; // ✅ import page store

	import type { LayoutProps } from './$types';
	let { data, children }: LayoutProps = $props();
	const { user, models } = data;

	setupConvex(PUBLIC_CONVEX_URL);

	let sidebarOpen = $state(true);
	let searchModalOpen = $state(false); // State for search modal

	// Handle keyboard shortcuts
	function handleGlobalKeydown(event) {
		// Ctrl/Cmd + K to open search
		if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
			event.preventDefault();
			searchModalOpen = true;
		}
	}
</script>

<svelte:window onkeydown={handleGlobalKeydown} />

<Sidebar.Provider bind:open={sidebarOpen}>
	<AppSidebar {user} />
	<main class="relative w-full">
		<div class="sticky top-1 left-1 z-10 m-1 w-fit">
			<div class="bg-muted/50 flex items-center space-x-1 rounded p-1">
				<Sidebar.Trigger title="Toggle Sidebar (Ctrl+b)" />
				<!-- Empty div = spacer -->
				<div class="border-background/70 h-4 flex-1 border opacity-20"></div>
				<Button
					size="icon"
					variant="ghost"
					class="size-7"
					onclick={() => (searchModalOpen = true)}
					title="Search threads (Ctrl+K)"
				>
					<Search />
				</Button>
				<Button
					size="icon"
					variant="ghost"
					href="/"
					disabled={$page.url.pathname === '/'}
					class={`size-7 ${$page.url.pathname === '/' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
				>
					<SquarePen />
				</Button>
			</div>
		</div>
		<div class="container ">
			{@render children?.()}
		</div>
	</main>

	<!-- Search Modal -->
	<ThreadSearchModal bind:open={searchModalOpen} {user} />
</Sidebar.Provider>

<style>
	.container {
		max-width: 100%;
		padding: 0 !important; 
		margin: 0 auto;
	}
	.main {
		padding: 0 !important;
		margin: 0 auto;
		height: 100%;
	}
</style>