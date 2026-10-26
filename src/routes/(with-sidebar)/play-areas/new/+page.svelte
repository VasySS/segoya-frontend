<script lang="ts">
	import { m } from '#paraglide/messages.js';
	import AreaEditor from '#components/play-areas/AreaEditor.svelte';

	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head><title>Segoya — {m.areaNew()}</title></svelte:head>
<div class="mx-auto w-full max-w-4xl space-y-6">
	<h1>{m.areaNew()}</h1>
	<AreaEditor
		jwt={data.jwtToken ?? ''}
		error={form?.error}
	/>
</div>
