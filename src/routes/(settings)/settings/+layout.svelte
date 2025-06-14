<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';

	import { ArrowLeft, User } from 'lucide-svelte';

	import type { LayoutProps } from './$types';
	let { data, children }: LayoutProps = $props();
	const { user } = data;
</script>

<div class="container mx-auto py-6">
	<div class="mb-6 flex items-center justify-between">
		<Button variant="ghost" size="sm">
			<a href="/" class="flex items-center gap-2">
				<ArrowLeft class="h-4 w-4" />
				Back to Chat
			</a>
		</Button>
		<Button href="/logout" variant="outline" size="sm">Sign out</Button>
	</div>

	<div class="mx-2 grid gap-6 md:grid-cols-[250px_1fr]">
		<div class="flex flex-col items-center gap-4">
			<div>
				<Avatar.Root class="border-border h-32 w-32 border-2">
					<!--<AvatarImage src="/placeholder.svg?height=128&width=128" alt="User avatar" />-->
					<Avatar.Fallback><User class="h-32 w-32" /></Avatar.Fallback>
				</Avatar.Root>
				<div class="text-center">
					<h2 class="text-xl font-bold">Aidan Perry</h2>
					<p class="text-muted-foreground text-sm">aidanperry@gmail.com</p>
					{#if user.stripeSubscriptionId}
						<Badge class="px-3 py-1">Pro Plan</Badge>
					{:else}
						<Badge variant="secondary" class="px-3 py-1">Free Plan</Badge>
					{/if}
				</div>
			</div>
			<Card>
				<CardHeader>
					<CardTitle>Message Usage</CardTitle>
					<CardDescription>Resets tomorrow at 7:00 PM</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium">Standard</span>
							<span className="text-sm font-medium">1/20</span>
						</div>
						<Progress value={5} className="h-2" />
						<p className="text-sm text-muted-foreground">19 messages remaining</p>
					</div>
				</CardContent>
			</Card>
		</div>
		{@render children()}
	</div>
</div>
