<script>
  import hljs from 'highlight.js';
	import 'highlight.js/styles/github.css'; // or any other theme

	let { code, language = '' } = $props();

  let highlighted = $derived.by(() => {
		if (language && hljs.getLanguage(language)) {
			return hljs.highlight(code, { language }).value;
		}
		return hljs.highlightAuto(code).value;
	});

	let copied = $state(false);

	function copy() {
		navigator.clipboard.writeText(code).then(() => {
			copied = true;
			setTimeout(() => copied = false, 1000);
		});
	}
</script>

<div class="not-prose">
	<pre><code class="hljs language-{language}">{@html highlighted}</code></pre>
</div>