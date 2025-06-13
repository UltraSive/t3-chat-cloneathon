<script lang="ts">
	let { isAtBottom = $bindable(false), scrollToBottom } = $props();
</script>

<button
	onclick={scrollToBottom}
	class="scroll-down-button"
	style:display={isAtBottom ? 'none' : 'block'}
>
	Scroll Down
</button>

<style>
	.scroll-down-button {
		position: fixed;
		bottom: 20px;
		right: 20px;
		background: blue;
		color: white;
		border: none;
		padding: 10px;
		border-radius: 5px;
		cursor: pointer;
	}
	.scroll-down-button:hover {
		background: darkblue;
	}
</style>
