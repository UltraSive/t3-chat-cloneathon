<script>
	let { models, selected = $bindable() } = $props();

	import * as Select from '$lib/components/ui/select';
</script>

{#if models && models.length > 0}
	<Select.Root type="single" bind:value={selected}>
		<Select.Trigger class="w-[180px] bg-background/70 backdrop-blur-md">
			{@const model = models.find((model) => model.id === selected)}
			{model.name}
		</Select.Trigger>
		<Select.Content>
			{#each models as model}
				<Select.Item value={model.id}>{model.name}</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>
{/if}
