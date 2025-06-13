<script lang="ts">
	import CodeBlock from './CodeBlock.svelte';
	import { marked } from 'marked';
	let { content = $bindable('') } = $props();

	// Parse markdown content
	let tokens = $derived(marked.lexer(content));
</script>

<div
	class="prose dark:prose-invert prose-code:bg-muted prose-code:text-muted-foreground prose-code:before:hidden prose-code:after:hidden prose-pre:bg-muted prose-pre:text-muted-foreground"
>
	{#each tokens as token}
		{#if token.type === 'code'}
			<CodeBlock bind:code={token.text} bind:language={token.lang} />
		{:else}
			{@html marked.parser([token])}
		{/if}
	{/each}
</div>

<style>
	.prose {
		max-width: none; /* or specify your desired width */
	}
</style>
