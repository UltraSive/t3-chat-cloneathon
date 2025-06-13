<script lang="ts">
	import hljs from 'highlight.js';
	import 'highlight.js/styles/github.css';

	let { code = $bindable(""), language = $bindable('') } = $props();

	let highlighted = $derived.by(() => {
		if (language && hljs.getLanguage(language)) {
			return hljs.highlight(code, { language }).value;
		}
		return hljs.highlightAuto(code).value;
	});

	let copied = $state(false);
	let blockEl: HTMLDivElement;
	let sticky = $state(false);
	let blockRect = $state({ top: 0, left: 0, width: 0 });

	function copy() {
		navigator.clipboard.writeText(code).then(() => {
			copied = true;
			setTimeout(() => (copied = false), 1000);
		});
	}

	$effect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				const rect = entry.boundingClientRect;

				const fullyVisible = entry.intersectionRatio === 1;
				const fullyInvisible = rect.bottom <= 0 || rect.top >= window.innerHeight;

				// Show sticky when it's partially visible but not fully
				sticky = !fullyVisible && !fullyInvisible;

				if (!fullyInvisible) {
					blockRect = {
						top: rect.top,
						left: rect.left,
						width: rect.width
					};
				}
			},
			{
				root: null,
				threshold: [0, 1]
			}
		);

		if (blockEl) observer.observe(blockEl);
		return () => observer.disconnect();
	});
</script>

<div bind:this={blockEl} class="not-prose relative my-4">
	<!-- Sticky copy bar when scrolled past 
	{#if sticky}
		<div
			class="bg-muted fixed z-50 flex items-center justify-between border-b px-4 py-2 font-mono text-xs"
			style="top: 0; left: {blockRect.left}px; width: {blockRect.width}px"
		>
			<span class="text-muted-foreground">{language || 'code'}</span>
			<button
				onclick={copy}
				class="text-muted-foreground bg-muted hover:bg-muted/80 rounded px-2 py-1 transition"
			>
				{copied ? 'Copied!' : 'Copy'}
			</button>
		</div>
	{/if}-->

	<!-- Normal title/copy row -->
	<div class="bg-muted flex items-center justify-between rounded-t px-4 py-2 font-mono text-xs">
		<span class="text-muted-foreground">{language || 'code'}</span>
		<button
			onclick={copy}
			class="text-muted-foreground bg-muted hover:bg-muted/80 rounded px-2 py-1 transition"
		>
			{copied ? 'Copied!' : 'Copy'}
		</button>
	</div>

	<!-- Code block -->
	<pre class="bg-muted overflow-x-auto rounded-b text-sm">
		<code class="hljs language-{language} py-0">{@html highlighted}</code>
	</pre>
</div>

<style>
	.hljs {
		background: transparent !important;
		padding-top: 0 !important;
		padding-bottom: 0 !important;
	}
</style>
