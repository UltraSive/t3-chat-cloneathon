<script>
	import { AlertCircle, RefreshCw } from 'lucide-svelte';

	import { Button } from '$lib/components/ui/button';

  let { error } = $props();
</script>

<main class="flex w-full flex-1 flex-col items-center justify-center px-4">
	<div class="flex justify-center">
		<div class="bg-destructive/30 rounded-full">
			<AlertCircle class="text-destructive h-8 w-8" />
		</div>
	</div>

	<h1 class="text-2xl font-semibold">Unable to load chat</h1>

	<p class="text-muted-foreground">
    {error}
	</p>

	<div class="space-y-3">
		<Button class="w-full">
			<RefreshCw class="mr-2 h-4 w-4" />
			Retry
		</Button>
	</div>
</main>
