<script lang="ts">
	import type { Provider } from '#lib/api/openapi.js';
	import { providers } from '#lib/constants/panoramaProviders.js';
	import { m } from '#paraglide/messages.js';
	import { enhance, type SubmitFunction } from '$app/forms';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { toast } from 'svelte-sonner';
	import AreaCount from '#components/play-areas/AreaCount.svelte';
	import AreaEditor from '#components/play-areas/AreaEditor.svelte';
	import PlayAreaMap from '#components/play-areas/PlayAreaMap.svelte';
	import Button from '#components/shadcn/button/button.svelte';

	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let provider = $state<Provider>('google');
	const shareLink = $derived(
		new URL(resolve('/(with-sidebar)/play-areas/[id]', { id: data.area.id }), page.url.origin).href
	);

	async function copyLink() {
		try {
			await navigator.clipboard.writeText(shareLink);
			toast.success(m.areaLinkCopied());
		} catch {
			// The selectable link remains visible.
		}
	}
	const handleShareResult: Exclude<Awaited<ReturnType<SubmitFunction>>, void> = async ({
		result,
		update
	}) => {
		await update({ reset: false });
		if (result.type === 'success' && result.data?.linkReady === true) await copyLink();
	};
	const submitShare: SubmitFunction = () => handleShareResult;
</script>

<svelte:head><title>Segoya — {data.area.name}</title></svelte:head>

<div class="mx-auto w-full max-w-4xl space-y-6">
	<h1 class="wrap-break-word">{data.area.name}</h1>
	<div class="flex flex-wrap gap-3">
		<Button href={`${resolve('/(with-sidebar)/quick-game')}?area=${data.area.id}`}>
			{m.areaUseSingleplayer()}
		</Button>
		<Button
			variant="outline"
			href={`${resolve('/(with-sidebar)/lobbies/new')}?area=${data.area.id}`}
		>
			{m.areaUseLobby()}
		</Button>
	</div>
	<p class="text-muted-foreground text-sm">{m.areaSnapshotsHelp()}</p>
	{#if data.isOwner}
		<AreaEditor
			jwt={data.jwtToken ?? ''}
			initialName={data.area.name}
			initialPolygon={data.area.polygon}
			initialVisibility={data.area.visibility}
			error={form?.error}
			action="?/save"
		/>
		<div class="flex flex-wrap gap-3">
			<form
				method="post"
				action="?/share"
				use:enhance={submitShare}
			>
				<Button
					type="submit"
					variant="outline"
				>
					{m.areaShare()}
				</Button>
			</form>

			<form
				method="post"
				action="?/delete"
				onsubmit={(event) => {
					if (!confirm(m.areaConfirmDelete())) event.preventDefault();
				}}
			>
				<Button
					type="submit"
					variant="destructive"
				>
					{m.areaDelete()}
				</Button>
			</form>
		</div>
	{:else}
		<p>{m.areaReadOnly()}</p>
		<PlayAreaMap
			readonly
			polygon={data.area.polygon}
			{provider}
		/>

		<label class="block space-y-2">
			<span>{m.panoramaProvider()}</span>
			<select
				class="border-input bg-background h-11 rounded-md border px-3"
				bind:value={provider}
			>
				{#each providers as p (p.value)}
					<option value={p.value}>{p.label}</option>
				{/each}
			</select>
		</label>

		<AreaCount
			jwt={data.jwtToken ?? ''}
			{provider}
			selection={{ type: 'polygon', polygon: data.area.polygon }}
		/>
	{/if}

	{#if data.area.visibility === 'unlisted' || form?.linkReady}
		<label class="block space-y-2">
			<span>{m.areaLink()}</span>
			<input
				readonly
				class="border-input bg-background h-11 w-full rounded-md border px-3"
				value={shareLink}
				onclick={(event) => {
					event.currentTarget.select();
				}}
			/>
		</label>

		<Button
			type="button"
			variant="outline"
			onclick={copyLink}
		>
			{m.areaShare()}
		</Button>
	{/if}
</div>
