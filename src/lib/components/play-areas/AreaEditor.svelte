<script lang="ts">
	import type { Polygon, Provider } from '#lib/api/openapi.js';
	import { providers } from '#lib/constants/panoramaProviders.js';
	import { polygonError } from '#lib/play-areas/geometry.js';
	import { m } from '#paraglide/messages.js';
	import { enhance } from '$app/forms';
	import Button from '#components/shadcn/button/button.svelte';
	import { Input } from '#components/shadcn/input/index.js';

	import AreaCount from './AreaCount.svelte';
	import PlayAreaMap from './PlayAreaMap.svelte';

	let {
		jwt,
		initialName = '',
		initialPolygon,
		initialVisibility = 'private',
		error = '',
		action
	}: {
		jwt: string;
		initialName?: string;
		initialPolygon?: Polygon | undefined;
		initialVisibility?: string;
		error?: string | undefined;
		action?: string;
	} = $props();

	// svelte-ignore state_referenced_locally
	let name = $state(initialName);
	// svelte-ignore state_referenced_locally
	let polygon = $state<Polygon | undefined>(initialPolygon);
	let visibility = $derived(initialVisibility);
	let provider = $state<Provider>('google');
	let isIncomplete = $state(false);
	let isSaving = $state(false);
	const isValid = $derived(
		!!polygon &&
			!polygonError(polygon) &&
			!isIncomplete &&
			name.trim().length > 0 &&
			name.trim().length <= 100
	);
</script>

<form
	method="post"
	{action}
	use:enhance={() => {
		isSaving = true;
		return async ({ update }) => {
			try {
				await update({ reset: false });
			} finally {
				isSaving = false;
			}
		};
	}}
	class="space-y-5"
>
	<label class="block space-y-2">
		<span>{m.areaName()}</span>
		<Input
			name="name"
			bind:value={name}
			required
			maxlength={100}
		/>
	</label>

	<label class="block space-y-2">
		<span>{m.areaVisibility()}</span>
		<select
			name="visibility"
			bind:value={visibility}
			class="border-input bg-background h-11 w-full rounded-md border px-3"
		>
			<option value="private">{m.areaPrivate()}</option>
			<option value="unlisted">{m.areaUnlisted()}</option>
		</select>
	</label>

	<PlayAreaMap
		bind:polygon
		bind:incomplete={isIncomplete}
		{provider}
	/>

	<input
		type="hidden"
		name="polygonJSON"
		value={polygon ? JSON.stringify(polygon) : ''}
	/>

	<label class="block space-y-2">
		<span>{m.panoramaProvider()}</span>
		<select
			bind:value={provider}
			class="border-input bg-background h-11 rounded-md border px-3"
		>
			{#each providers as p (p.value)}
				<option value={p.value}>{p.label}</option>
			{/each}
		</select>
	</label>

	{#if polygon}<AreaCount
			{jwt}
			{provider}
			selection={{ type: 'polygon', polygon }}
			incomplete={isIncomplete}
		/>
	{/if}

	<p class="text-muted-foreground text-sm">{m.areaEmptySave()}</p>

	{#if error}
		<p
			role="alert"
			class="text-destructive"
		>
			{error}
		</p>
	{/if}

	<Button
		type="submit"
		disabled={!isValid || isSaving}
	>
		{isSaving ? m.areaSaving() : m.areaSave()}
	</Button>
</form>
