<script>
	import { marked } from 'marked';

	let { content = 'Markdown content goes here...' } = $props();

	const parsedContent = marked.parse(content);
</script>

<article
	class="prose dark:prose-invert prose-code:bg-muted prose-code:text-muted-foreground prose-code:before:hidden prose-code:after:hidden prose-pre:bg-muted prose-pre:text-muted-foreground"
>
	{@html parsedContent}
</article>
