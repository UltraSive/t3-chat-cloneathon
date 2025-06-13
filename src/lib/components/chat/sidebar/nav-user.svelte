<script lang="ts">
	import { toggleMode } from 'mode-watcher';

	import * as Avatar from '$lib/components/ui/avatar';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { useSidebar } from '$lib/components/ui/sidebar';

	import {
		SparklesIcon,
		LogOutIcon,
		Settings,
		ChevronsUpDownIcon,
		BadgeCheckIcon,
		Sun,
		Moon,
    LogIn
	} from 'lucide-svelte';
	let { user } = $props();

	const sidebar = useSidebar();
</script>

<Sidebar.Menu>
	<Sidebar.MenuItem>
		{#if user}
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<Sidebar.MenuButton
							{...props}
							size="lg"
							class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar.Root class="size-8 rounded-lg">
								<Avatar.Image src={user.avatar} alt={user.name} />
								<Avatar.Fallback class="rounded-lg">CN</Avatar.Fallback>
							</Avatar.Root>
							<div class="grid flex-1 text-left text-sm leading-tight">
								<span class="truncate font-medium">{user.name}</span>
								<span class="truncate text-xs">{user.stripeSubscriptionId ? 'Pro' : 'Free'}</span>
							</div>
							<ChevronsUpDownIcon class="ml-auto size-4" />
						</Sidebar.MenuButton>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content
					class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
					side={sidebar.isMobile ? 'bottom' : 'right'}
					align="end"
					sideOffset={4}
				>
					<DropdownMenu.Label class="p-0 font-normal">
						{#if user}
							<div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar.Root class="size-8 rounded-lg">
									<Avatar.Image src={user.avatar} alt={user.name} />
									<Avatar.Fallback class="rounded-lg">CN</Avatar.Fallback>
								</Avatar.Root>
								<div class="grid flex-1 text-left text-sm leading-tight">
									<span class="truncate font-medium">{user.name}</span>
									<span class="truncate text-xs">{user.email}</span>
								</div>
							</div>
						{/if}
					</DropdownMenu.Label>
					<DropdownMenu.Separator />
					<DropdownMenu.Group>
						{#if !user.stripeSubscriptionId}
							<DropdownMenu.Item onclick={() => (document.location = '/upgrade')}>
								<SparklesIcon />
								Upgrade to Pro
							</DropdownMenu.Item>
						{/if}
					</DropdownMenu.Group>
					<DropdownMenu.Group>
						<DropdownMenu.Item onclick={() => (document.location = '/settings')}>
							<Settings />
							Settings
						</DropdownMenu.Item>
					</DropdownMenu.Group><!--
				<DropdownMenu.Item onclick={toggleMode}>
					<Sun
						class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
					/>
					<Moon
						class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
					/>
					Toggle Mode
				</DropdownMenu.Item>
        -->
					<DropdownMenu.Separator />
					<DropdownMenu.Item onclick={() => (document.location = '/logout')}>
						<LogOutIcon />
						Log out
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		{:else}
			<Sidebar.MenuButton class="p-8">
					<a href="/login/google" class="text-xl font-semibold p-5 flex items-center space-x-2"><LogIn class="w-5 h-5 mr-3" />Log In</a>
			</Sidebar.MenuButton>
		{/if}
	</Sidebar.MenuItem>
</Sidebar.Menu>
