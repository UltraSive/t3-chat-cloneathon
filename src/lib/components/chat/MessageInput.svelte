<script lang="ts">
	import { goto } from '$app/navigation';

	import { toast } from 'svelte-sonner';
	import { useQuery } from 'convex-svelte';
	import { api } from '$convex/_generated/api.js';

	import { preventDefault } from '$lib/modifiers';

	let {
		user,
		thread,
		models,
		model = $bindable(),
		processing = $bindable(),
		count = $bindable()
	} = $props();

	import ModelSelect from './ModelSelect.svelte';

	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	// Make sure AlertDialog and Alert are imported correctly
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as Alert from '$lib/components/ui/alert';

	import {
		Send,
		Paperclip,
		Search,
		SearchCheck,
		CircleAlertIcon,
		ExternalLink
	} from 'lucide-svelte';

	let text = $state('');
	let selectedModel = $derived(models.find((m) => m.id === model));
	let search = $state(false); // This holds the actual search state
	let submitting = $state(false);
	function disableSearch() {
		search = false;
		toast.info('Search functionality disabled.');
	}

	function confirmEnableSearch() {
		search = true;
		toast.info('Search functionality enabled!');
	}

	async function submitPrompt(
		event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }
	) {
		// Prevent empty messages from being sent
		if (!text.trim()) {
			toast.warning('Please enter a message.');
			submitting = false;
			return;
		}

		submitting = true;

		const data = new FormData(event.currentTarget);
		const message = data.get('message');

		const response = await fetch('/prompt', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include',
			body: JSON.stringify({
				thread,
				model,
				message,
				search
			})
		});

		const res = await response.json();

		if (!response.ok) {
			submitting = false;
			toast.error(res.message);
			return;
		}

		if (!thread) {
			goto(`/chat/${res.thread}`);
		}

		text = '';
		submitting = false;
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault(); // Prevents new line
			const form = event.currentTarget.closest('form');
			if (form) {
				form.dispatchEvent(new Event('submit', { cancelable: true })); // Submit the form
			}
		}
	}

	const countQuery = $derived(
		useQuery(api.messages.getAssistantMessageCounts, {
			user: user.id,
			anchorDate: user.stripeSubscriptionId ? user.subscribedAt.getTime() : user.createdAt.getTime()
		})
	);
</script>

<div class="">
	<div class="mx-auto max-w-3xl">
		<div class="mb-2 flex justify-center">
			{#if countQuery.isLoading}{:else if countQuery.error}{:else}
				{@const totalCount = countQuery.data.totalCount}
				{@const premiumCount = countQuery.data.premiumCount}
				{@const messagesAllowed = user.stripeSubscriptionId ? 1500 : 30}
				{@const messagesLeft = messagesAllowed - totalCount}
				{#if messagesLeft < 10}
					<Alert.Root variant="destructive" class="bg-muted/50 backdrop-blur-lg">
						<CircleAlertIcon class="size-4" />
						<Alert.Title>Running low on messages</Alert.Title>
						<Alert.Description
							><span
								>You have {messagesLeft} messages left.
								{#if !user.stripeSubscriptionId}
									<a href="/upgrade" class="flex items-center underline">
										Upgrade <ExternalLink class="ml-1 h-3 w-3" /></a
									> to unlock more.
								{:else}{/if}</span
							>
						</Alert.Description>
					</Alert.Root>
				{/if}
			{/if}
		</div>
		<div class="mb-2 flex justify-end">
			<div class="flex items-center space-x-2">
				{#if search == true}
					<Button type="button" size="icon" variant="ghost" onclick={disableSearch}>
						<SearchCheck class="text-primary h-4 w-4" />
					</Button>
				{:else}
					<AlertDialog.Root>
						<AlertDialog.Trigger asChild>
							<Button type="button" size="icon" variant="ghost">
								<Search class="h-4 w-4" />
							</Button>
						</AlertDialog.Trigger>
						<AlertDialog.Content class="bg-background/90 backdrop-blur-lg">
							<AlertDialog.Header>
								<AlertDialog.Title>Enable Search Functionality?</AlertDialog.Title>
								<AlertDialog.Description>
									Enabling search allows the AI to perform web searches to answer your prompts. This
									might use additional resources or message credits. Do you want to proceed?
								</AlertDialog.Description>
							</AlertDialog.Header>
							<AlertDialog.Footer>
								<AlertDialog.Cancel class="cursor-pointer">Cancel</AlertDialog.Cancel>
								<Button
									type="button"
									variant="primary"
									onclick={confirmEnableSearch}
									class="bg-primary ml-2"
								>
									Enable Search
								</Button>
							</AlertDialog.Footer>
						</AlertDialog.Content>
					</AlertDialog.Root>
				{/if}
				<ModelSelect {models} bind:selected={model} />
			</div>
		</div>
		<div class="bg-muted/50 relative rounded-lg p-2 backdrop-blur-sm">
			<form method="POST" class="" onsubmit={preventDefault(submitPrompt)}>
				<Textarea
					id="message"
					name="message"
					placeholder="Message assistant..."
					class="max-h-72 min-h-36 resize-none pr-12"
					bind:value={text}
					disabled={submitting || processing || !model}
					onkeydown={handleKeyDown}
				/>
				<Button
					type="submit"
					size="icon"
					disabled={submitting || processing || !model}
					class="absolute right-2 bottom-2 m-2"
				>
					<Send class="h-4 w-4" />
				</Button>
			</form>
		</div>
	</div>
</div>