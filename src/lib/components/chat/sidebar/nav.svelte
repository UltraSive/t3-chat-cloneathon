<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar';
  import NavMain from './nav-main.svelte';

  import { SquarePen } from "lucide-svelte"

	const data = {
		navMain: [
			{
				title: 'New Thread',
				url: '/',
				icon: SquarePen
			},
		]
	};
</script>

<Sidebar.Root>
	<Sidebar.Header>
    <Sidebar.Trigger />
    <NavMain items={data.navMain} />
  </Sidebar.Header>
	<Sidebar.Content>
		<Sidebar.Group />
		<Sidebar.Group />
	</Sidebar.Content>
	<Sidebar.Footer />
</Sidebar.Root>
