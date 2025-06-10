<script lang="ts">
	import { PUBLIC_CONVEX_URL } from '$env/static/public';
	import { setupConvex } from 'convex-svelte';

	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppSidebar from '$lib/components/chat/sidebar/nav.svelte';

	const { children } = $props();
	setupConvex(PUBLIC_CONVEX_URL);
</script>

<Sidebar.Provider>
	<AppSidebar />
	<main class="w-full">
		<!--<Sidebar.Trigger />-->
		{@render children?.()}
	</main>
</Sidebar.Provider>
