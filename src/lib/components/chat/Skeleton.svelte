<script>
	import { Skeleton } from '$lib/components/ui/skeleton';

	import { User, Bot } from 'lucide-svelte';
</script>

<div class="bg-muted/20 mb-6 flex flex-row-reverse gap-4 rounded-lg p-4">
	<div class="bg-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-md select-none">
		<User class="h-4 w-4 text-white" />
	</div>

	<div class="flex-1 space-y-2 overflow-hidden px-1 text-right">
		<div class="font-semibold"><Skeleton class="h-4 w-8" /></div>
		<Skeleton class="h-4 w-full" />
		<Skeleton class="h-4 w-3/4" />
	</div>
</div>
<div class="mb-6 flex gap-4 rounded-lg p-4">
	<div class="bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-md select-none">
		<Bot class="text-foreground h-4 w-4" />
	</div>

	<div class="flex-1 space-y-2 overflow-hidden px-1">
		<div class="font-semibold"><Skeleton class="h-4 w-24" /></div>
		<Skeleton class="h-4 w-full" />
		<Skeleton class="h-4 w-full" />
		<Skeleton class="h-4 w-5/6" />
		<Skeleton class="h-4 w-full" />
		<Skeleton class="h-4 w-4/5" />
		<Skeleton class="h-4 w-3/4" />
	</div>
</div>
