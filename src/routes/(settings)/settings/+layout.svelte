<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';

	import { ArrowLeft, User } from 'lucide-svelte';

	import type { LayoutProps } from './$types';
	let { data, children }: LayoutProps = $props();
	const { user } = data;

	// Helper function to get user initials for avatar fallback
	function getUserInitials(name?: string): string {
		if (!name) return 'U';
		return name
			.split(' ')
			.map(word => word.charAt(0))
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}

	// Helper function to get display name
	function getDisplayName(): string {
		if (user?.firstName && user?.lastName) {
			return `${user.firstName} ${user.lastName}`.trim();
		}
		if (user?.name) {
			return user.name;
		}
		if (user?.displayName) {
			return user.displayName;
		}
		if (user?.email) {
			return user.email;
		}
		return 'User';
	}
</script>

<div class="container mx-auto py-6">
	<div class="mb-6 flex items-center justify-between">
		<Button variant="ghost" size="sm" asChild>
			<a href="/" class="flex items-center gap-2">
				<ArrowLeft class="h-4 w-4" />
				Back to Chat
			</a>
		</Button>
		<Button href="/logout" variant="outline" size="sm">Sign out</Button>
	</div>
	<div class="mx-2 grid gap-8 md:grid-cols-[250px_1fr] md:gap-12">
		<div class="flex flex-col items-center text-center gap-6 p-4">
			<Avatar.Root class="border-border h-32 w-32 border-2 shadow-md">
				{#if user?.avatar || user?.profileImage}
					<Avatar.Image src={user.avatar || user.profileImage} alt="User avatar" />
				{/if}
				<Avatar.Fallback class="text-2xl font-semibold">
					{getUserInitials(getDisplayName())}
				</Avatar.Fallback>
			</Avatar.Root>
			<div class="space-y-1">
				<h2 class="text-2xl font-bold">{getDisplayName()}</h2>
				<p class="text-muted-foreground text-sm">{user?.email || 'No email provided'}</p>
				{#if user?.stripeSubscriptionId}
					<Badge class="px-3 py-1 mt-2">Pro Plan</Badge>
				{:else}
					<Badge variant="secondary" class="px-3 py-1 mt-2">Free Plan</Badge>
				{/if}
			</div>
		</div>
		<div class="p-4">
			{@render children()}
		</div>
	</div>
</div>