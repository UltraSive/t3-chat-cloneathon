<script>
	let { code, lang = '' } = $props();

	let copied = $state(false);

	function copy() {
		navigator.clipboard.writeText(code).then(() => {
			copied = true;
			setTimeout(() => copied = false, 1000);
		});
	}
</script>

<div class="code-block-wrapper">
	<button class="copy-btn" onclick={copy}>
		{copied ? 'Copied!' : 'Copy'}
	</button>
	<pre><code class="hljs language-{lang}">{@html code}</code></pre>
</div>

<style>
	.code-block-wrapper {
		position: relative;
	}

	.copy-btn {
		position: absolute;
		top: 6px;
		right: 6px;
		font-size: 0.75rem;
		padding: 2px 6px;
		cursor: pointer;
		border: none;
		border-radius: 4px;
		background: #f0f0f0;
	}

	pre {
		padding-top: 2em;
	}
</style>
