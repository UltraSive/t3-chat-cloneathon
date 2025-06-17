<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar';

	import NavMain from './nav-main.svelte';
	import SearchForm from './search-form.svelte';
	import NavThreads from './nav-threads.svelte';
	import NavUser from './nav-user.svelte';

	import { SquarePen } from 'lucide-svelte';

	let { user } = $props();

	const data = {
		navMain: [
			{
				title: 'New Thread',
				url: '/',
				icon: SquarePen
			}
		]
	};
</script>

<Sidebar.Root>
	<Sidebar.Header>
		<SearchForm />
	</Sidebar.Header>
	<Sidebar.Content>
		<NavThreads {user} />
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser {user} />
	</Sidebar.Footer>
</Sidebar.Root>
