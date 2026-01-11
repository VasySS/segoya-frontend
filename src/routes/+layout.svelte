<script lang="ts">
	import { Toaster } from '$components/shadcn/sonner/index';
	import { ModeWatcher } from 'mode-watcher';

	import '../app.css';

	let { children } = $props();
</script>

<!-- theme change observer -->
<ModeWatcher />
<!-- sonner component for popups -->
<Toaster expand={true} />

{@render children()}
