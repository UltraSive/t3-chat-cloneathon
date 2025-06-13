<script lang="ts">
  import "../app.css";

  import { ModeWatcher, setMode } from 'mode-watcher';
  setMode("dark");

  const { children } = $props();
</script>

{@render children()}

<ModeWatcher />