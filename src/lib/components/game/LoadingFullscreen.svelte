<!-- https://github.com/Schum123/svelte-loading-spinners/blob/master/src/lib/Circle.svelte -->
<script lang="ts">
	import { LoaderCircle } from '@lucide/svelte';
	import { m } from '$paraglide/messages.js';
</script>

<div
	id="center_block"
	class="z-50"
>
	<LoaderCircle class="size-20 animate-spin" />
	<p class="pt-5">{m.loading()}</p>
</div>

<style>
	#center_block {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}
</style>
