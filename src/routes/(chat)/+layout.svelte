<script lang="ts">
	import { PUBLIC_CONVEX_URL } from '$env/static/public';
	import { setupConvex } from 'convex-svelte';

	import * as Sidebar from '$lib/components/ui/sidebar';
	import { Button } from '$lib/components/ui/button';

	import AppSidebar from '$lib/components/chat/sidebar/nav.svelte';
	import ModelSelect from '$lib/components/chat/ModelSelect.svelte';

	import { SquarePen } from 'lucide-svelte';

	import { getModel, setModel } from "$lib/components/chat/settings.svelte";

	import type { LayoutProps } from './$types';
	let { data, children }: LayoutProps = $props();
	const { user, models } = data;

	setupConvex(PUBLIC_CONVEX_URL);

	let sidebarOpen = $state(true);
	//$inspect(sidebarOpen)
</script>

<Sidebar.Provider bind:open={sidebarOpen}>
	<AppSidebar {user} />
	<main class="w-full relative">
    <div class="sticky top-1 left-1 z-10 m-1 w-fit">
        <div class="flex items-center bg-muted/50 space-x-1 rounded p-1">
            <Sidebar.Trigger />
            <Button size="icon" variant="ghost" class="size-7" href="/"><SquarePen /></Button>
        </div>
    </div>
    {@render children?.()}
</main>
</Sidebar.Provider>
