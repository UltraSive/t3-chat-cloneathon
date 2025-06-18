<script lang="ts">
	import { fly } from 'svelte/transition';

	import MessageInput from '$lib/components/chat/MessageInput.svelte';

	import { Button } from '$lib/components/ui/button';

	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
	const { user, models } = data;


	let model = $state(models[0].id);
</script>

<div class="container flex flex-1 flex-col overflow-hidden">
	<div in:fly={{ y: 20, duration: 800 }} class="flex flex-1 items-center justify-center px-4">
		<div class="flex flex-col items-center gap-4">
			<p class="text-2xl font-bold md:text-4xl">How can I assist you?</p>
			{#if !user}
				<p class="text-muted-foreground text-lg font-semibold">
					Create a free account to get access to models.
				</p>
				<!-- Login button -->
				<Button href="/login/google" class="bg-white text-black shadow-md hover:bg-gray-100">
					<img class="mr-2 h-5 w-5" src="https://google.com/favicon.ico" />
					Login with Google
				</Button>
			{/if}
		</div>
	</div>
	{#if user}
		<div class="bg-background/70 sticky bottom-2 mx-4 backdrop-blur-md">
			<MessageInput {user} bind:model {models} />
		</div>
	{/if}
</div>

<style>
	.container {
		min-height: calc(100vh - 4rem);
		margin: 0 auto;
	}
</style>
