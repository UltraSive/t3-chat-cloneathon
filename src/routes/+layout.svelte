<script lang="ts">
  import "../app.css";

  import { Toaster } from "$lib/components/ui/sonner";
  import { ModeWatcher, setMode } from 'mode-watcher';
  setMode("dark");

  const { children } = $props();
</script>

{@render children()}

<Toaster position="top-right" />
<ModeWatcher />