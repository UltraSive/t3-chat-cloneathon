<script lang="ts">
	import { marked } from 'marked';
	import hljs from 'highlight.js';
	import 'highlight.js/styles/github.css';
	import CodeBlock from './CodeBlock.svelte';

	let { content = $bindable('') } = $props();
</script>

<div
	class="prose dark:prose-invert prose-code:bg-muted prose-code:text-muted-foreground prose-code:before:hidden prose-code:after:hidden prose-pre:bg-muted prose-pre:text-muted-foreground"
>
	{@html marked(content)}
</div>
