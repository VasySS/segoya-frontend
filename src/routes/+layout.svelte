<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '#components/shadcn/sonner/index.js';

	import '../app.css';

	let { children } = $props();
</script>

<!-- theme change observer -->
<ModeWatcher />
<!-- sonner component for popups -->
<Toaster expand={true} />

{@render children()}
