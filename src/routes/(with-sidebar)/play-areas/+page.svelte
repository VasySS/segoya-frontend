<script lang="ts">
	import { m } from '#paraglide/messages.js';
	import { resolve } from '$app/paths';
	import Button from '#components/shadcn/button/button.svelte';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>Segoya — {m.areaLibrary()}</title></svelte:head>
<div class="mx-auto w-full max-w-4xl space-y-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<h1>{m.areaLibrary()}</h1>
		<Button href={resolve('/(with-sidebar)/play-areas/new')}>{m.areaNew()}</Button>
	</div>

	<p class="text-muted-foreground text-sm">{m.areaSnapshotsHelp()}</p>
	<div class="grid gap-3 sm:grid-cols-2">
		{#each data.areas as area (area.id)}
			<a
				class="bg-card hover:bg-accent/30 space-y-2 rounded-md border p-5 transition-colors"
				href={resolve('/(with-sidebar)/play-areas/[id]', { id: area.id })}
			>
				<h2 class="text-lg font-medium wrap-break-word">{area.name}</h2>
				<p class="text-muted-foreground text-sm">
					{area.visibility === 'private' ? m.areaPrivate() : m.areaUnlisted()}
				</p>
			</a>
		{:else}
			<p>{m.areaNone()}</p>
		{/each}
	</div>

	<div class="flex items-center gap-3">
		{#if data.page > 1}
			<Button
				variant="outline"
				href={`${resolve('/(with-sidebar)/play-areas')}?page=${String(data.page - 1)}`}
			>
				{m.areaPrevious()}
			</Button>
		{/if}
		<span>{m.areaPage({ page: String(data.page) })}</span>
		{#if data.page * 10 < data.total}
			<Button
				variant="outline"
				href={`${resolve('/(with-sidebar)/play-areas')}?page=${String(data.page + 1)}`}
			>
				{m.areaNext()}
			</Button>
		{/if}
	</div>
</div>
