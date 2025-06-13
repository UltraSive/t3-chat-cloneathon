<script>
	let { tools = $bindable(), selected = $bindable() } = $props();

	import * as Select from '$lib/components/ui/select';
</script>

<Select.Root type="single" bind:value={selected}>
	<Select.Trigger class="w-[120px]">
		{@const tool = tools.find((tool) => tool.id === selected)}
		{tool.name}
	</Select.Trigger>
	<Select.Content>
		{#each tools as tool}
			<Select.Item value={tool.id}>{tool.name}</Select.Item>
		{/each}
	</Select.Content>
</Select.Root>
