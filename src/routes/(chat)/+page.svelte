<script lang="ts">
	import MessageInput from '$lib/components/chat/message-input.svelte';

	import { Button } from '$lib/components/ui/button';

	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
	const { user } = data;
</script>

<div class="flex h-full flex-1 flex-col">
	<div class="flex h-full flex-col items-center justify-center gap-4">
		<p class="text-2xl font-bold md:text-4xl">How can I help you?</p>
		{#if !user}
			<p class="text-muted-foreground text-lg font-semibold">
				Create an free account to get higher limits
			</p>
			<!-- Login button -->
			<Button href="/login/google" class="bg-white text-black shadow-md hover:bg-gray-100">
				<svg
					class="mr-2 h-5 w-5"
					aria-hidden="true"
					focusable="false"
					data-prefix="fab"
					data-icon="google"
					role="img"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 488 512"
					fill="currentColor"
				>
					<path
						d="M488 261.8c0-17.8-1.6-35-4.6-51.6H249v97.8h135.6c-5.9 32.4-23.8 59.8-50.6 
					78.3v64.9h81.9c48-44.2 75.7-109.4 75.7-189.4z"
					/>
					<path
						d="M249 492c67 0 123.1-22.1 164.1-59.7l-81.9-64.9c-22.8 15.3-52 
					24.5-82.2 24.5-63 0-116.4-42.6-135.4-99.8H28.1v62.4C69.7 438.1 
					152.7 492 249 492z"
					/>
					<path
						d="M113.6 292.1c-4.8-14.4-7.6-29.6-7.6-45.1s2.7-30.7 
					7.6-45.1V139.5H28.1C10 173.2 0 210.5 0 247c0 36.5 10 
					73.8 28.1 107.5l85.5-62.4z"
					/>
					<path
						d="M249 100.4c35.8 0 67.8 12.3 93 36.5l69.8-69.8C372 
					29.4 316 0 249 0 152.7 0 69.7 53.9 28.1 139.5l85.5 
					62.4c19-57.2 72.4-99.8 135.4-99.8z"
					/>
				</svg>
				Login with Google
			</Button>
		{/if}
	</div>
	<div class="bg-background/70 sticky bottom-2 mx-4 backdrop-blur-md">
		<MessageInput />
	</div>
</div>
