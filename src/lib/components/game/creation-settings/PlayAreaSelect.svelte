<script lang="ts">
	import { fetchBackend } from '#lib/api/base.js';
	import type {
		PlayAreaPreset,
		PlayAreaSelection,
		Provider,
		SavedPlayArea
	} from '#lib/api/openapi.js';
	import { polygonError } from '#lib/play-areas/geometry.js';
	import { m } from '#paraglide/messages.js';
	import { resolve } from '$app/paths';
	import { untrack } from 'svelte';
	import { toast } from 'svelte-sonner';
	import AreaCount from '#components/play-areas/AreaCount.svelte';
	import PlayAreaMap from '#components/play-areas/PlayAreaMap.svelte';
	import Button from '#components/shadcn/button/button.svelte';
	import { Input } from '#components/shadcn/input/index.js';

	let {
		jwt,
		provider,
		rounds,
		selection = $bindable<PlayAreaSelection>({ type: 'all' }),
		eligible = $bindable(false),
		valid = $bindable(false),
		revision = 0
	}: {
		jwt: string;
		provider: Provider;
		rounds: number;
		selection?: PlayAreaSelection;
		eligible?: boolean;
		valid?: boolean;
		revision?: number;
	} = $props();
	let presets = $state<PlayAreaPreset[]>([]);
	let saved = $state<SavedPlayArea[]>([]);
	let selectedSaved = $state<SavedPlayArea>();
	let outlines = $state<PlayAreaPreset[]>([]);
	let search = $state('');
	let pageNumber = $state(1);
	let total = $state(0);
	let isLoading = $state(false);
	let error = $state('');
	let notice = $state('');
	let retry = $state(0);
	let previewID = $state('');
	const polygon = $derived(selection.type === 'polygon' ? selection.polygon : undefined);
	let isIncomplete = $state(false);
	let saveName = $state('');
	let isSaving = $state(false);
	let saveError = $state('');
	let drafts: Partial<Record<PlayAreaSelection['type'], PlayAreaSelection>> = {};
	const mode = $derived(selection.type);
	const filtered = $derived(
		presets.filter((p) => p.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()))
	);
	$effect(() => {
		const id = selection.type === 'saved' ? selection.savedID : undefined;
		selectedSaved = undefined;
		if (!id) return;
		const abort = new AbortController();
		void fetchBackend(jwt, 'get', '/v1/play-areas/{id}', { path: { id } }, { signal: abort.signal })
			.then((response) => {
				if (abort.signal.aborted) return;
				if (response.success) selectedSaved = response.data;
				else error = response.error.detail;
			})
			.catch(() => {
				if (!abort.signal.aborted) error = m.areaRequestFailed();
			});
		return () => {
			abort.abort();
		};
	});

	$effect(() => {
		// Include retry in the tracked request so a retry reruns the same query.
		const request = { provider, mode, pageNumber, retry };
		const currentMode = request.mode;
		if (currentMode !== 'presets' && currentMode !== 'saved') return;
		const currentProvider = request.provider,
			currentPage = request.pageNumber;
		const abort = new AbortController();
		isLoading = true;
		error = '';
		void (async () => {
			try {
				if (currentMode === 'presets') {
					const response = await fetchBackend(
						jwt,
						'get',
						'/v1/play-areas/presets',
						{ query: { provider: currentProvider } },
						{ signal: abort.signal }
					);
					if (abort.signal.aborted) return;
					if (!response.success) {
						error = response.error.detail;
						return;
					}
					presets = response.data;
					untrack(() => {
						if (selection.type !== 'presets') return;
						const ids = selection.presetIDs ?? [];
						const eligibleIDs = ids.filter((id) => response.data.some((p) => p.id === id));
						if (ids.length === eligibleIDs.length) {
							return;
						}

						notice = m.areaProviderReset();
						selection = { type: 'presets', presetIDs: eligibleIDs };
					});
				} else {
					const response = await fetchBackend(
						jwt,
						'get',
						'/v1/play-areas',
						{ query: { page: currentPage, 'page-size': 10 } },
						{ signal: abort.signal }
					);
					if (abort.signal.aborted) return;
					if (response.success) {
						saved = response.data.areas;
						total = response.data.total;
					} else error = response.error.detail;
				}
			} catch {
				if (!abort.signal.aborted) error = m.areaRequestFailed();
			} finally {
				if (!abort.signal.aborted) isLoading = false;
			}
		})();
		return () => {
			abort.abort();
		};
	});
	$effect(() => {
		const id = previewID;
		outlines = [];
		if (!id || mode !== 'presets') return;
		const abort = new AbortController();
		void fetchBackend(
			jwt,
			'get',
			'/v1/play-areas/presets/{id}',
			{ path: { id } },
			{ signal: abort.signal }
		)
			.then((response) => {
				if (!abort.signal.aborted && response.success) outlines = [response.data];
			})
			.catch(() => {
				if (!abort.signal.aborted) error = m.areaRequestFailed();
			});
		return () => {
			abort.abort();
		};
	});

	function changeMode(next: PlayAreaSelection['type']) {
		drafts[selection.type] = structuredClone($state.snapshot(selection));
		const defaultSelection: PlayAreaSelection =
			next === 'presets' ? { type: next, presetIDs: [] } : { type: next };
		selection = drafts[next] ?? defaultSelection;
		isIncomplete = false;
		previewID = '';
		notice = '';
	}
	function togglePreset(id: string, isChecked: boolean) {
		const ids = selection.presetIDs ?? [];
		selection = {
			type: 'presets',
			presetIDs: isChecked ? [...new Set([...ids, id])] : ids.filter((v) => v !== id)
		};
	}
	async function savePolygon() {
		const value = polygon;
		if (isIncomplete || !value || polygonError(value)) return;
		if (!saveName.trim() || saveName.trim().length > 100) {
			saveError = m.areaNameInvalid();
			return;
		}
		isSaving = true;
		saveError = '';
		try {
			const response = await fetchBackend(jwt, 'post', '/v1/play-areas', {
				body: { name: saveName.trim(), polygon: $state.snapshot(value), visibility: 'private' }
			});
			if (response.success) {
				toast.success(m.areaSavedSuccess());
				saveName = '';
			} else saveError = response.error.detail;
		} catch {
			saveError = m.areaRequestFailed();
		} finally {
			isSaving = false;
		}
	}
</script>

<fieldset class="min-w-0 space-y-4 rounded-md border p-4 [&_button]:min-h-11">
	<legend class="px-1 font-medium">{m.playArea()}</legend>
	<label class="block space-y-2">
		<span class="text-sm">{m.areaSelect()}</span>
		<select
			data-testid="play-area-mode"
			class="border-input bg-background h-11 w-full rounded-md border px-3"
			value={mode}
			onchange={(event) => {
				changeMode(event.currentTarget.value as PlayAreaSelection['type']);
			}}
		>
			<option value="all">{m.areaAll()}</option><option value="presets">{m.areaPresets()}</option>
			<option value="polygon">{m.areaDraw()}</option><option value="saved">{m.areaSaved()}</option>
		</select>
	</label>
	{#if notice}<p
			role="status"
			class="text-sm"
		>
			{notice}
		</p>{/if}
	{#if isLoading}<p role="status">{m.areaMapLoading()}</p>{/if}
	{#if error}<p
			role="alert"
			class="text-destructive text-sm"
		>
			{error}
		</p>
		<Button
			type="button"
			variant="outline"
			onclick={() => retry++}>{m.areaRetry()}</Button
		>{/if}
	{#if mode === 'presets'}
		<Input
			aria-label={m.areaSearch()}
			placeholder={m.areaSearch()}
			bind:value={search}
		/>
		<div class="max-h-64 space-y-1 overflow-y-auto rounded-md border p-2">
			{#each filtered as preset (preset.id)}
				<div class="flex items-center gap-2">
					<label class="flex min-h-11 min-w-0 flex-1 cursor-pointer items-center gap-3 p-1">
						<input
							type="checkbox"
							checked={selection.presetIDs?.includes(preset.id) ?? false}
							onchange={(event) => {
								togglePreset(preset.id, event.currentTarget.checked);
							}}
						/>
						<span class="min-w-0 flex-1 wrap-break-word">{preset.name}</span><span
							class="text-muted-foreground text-sm">{preset.locationCount ?? 0}</span
						>
					</label>
					<Button
						type="button"
						size="sm"
						variant="ghost"
						onclick={() => (previewID = preset.id)}
						aria-label={`${m.areaPreview()}: ${preset.name}`}>{m.areaPreview()}</Button
					>
				</div>
			{:else}<p class="p-2 text-sm">{m.areaNone()}</p>{/each}
		</div>
		{#if selection.presetIDs?.length}<div class="flex flex-wrap gap-2">
				{#each presets.filter((p) => selection.presetIDs?.includes(p.id)) as p (p.id)}<Button
						type="button"
						size="sm"
						variant="secondary"
						onclick={() => {
							togglePreset(p.id, false);
						}}>{p.name} ×</Button
					>{/each}
			</div>{/if}
		{#if outlines.length}
			<PlayAreaMap
				readonly
				{provider}
				outlines={outlines.map((p) => p.polygon).filter((p) => p !== undefined)}
			/>
			{#each outlines as preset (preset.id)}<p class="text-muted-foreground text-xs">
					{m.areaAttribution()}: {preset.source} · {preset.attribution} · {preset.license}
				</p>{/each}
		{/if}
	{:else if mode === 'polygon'}
		<PlayAreaMap
			bind:polygon={
				() => polygon,
				(value) => {
					selection = value ? { type: 'polygon', polygon: value } : { type: 'polygon' };
				}
			}
			{provider}
			bind:incomplete={isIncomplete}
		/>
		<div class="flex flex-col items-stretch gap-2 sm:flex-row sm:items-end">
			<label class="min-w-0 space-y-1 sm:flex-1"
				><span class="text-sm">{m.areaName()}</span><Input
					bind:value={saveName}
					maxlength={100}
				/></label
			>
			<Button
				type="button"
				variant="outline"
				onclick={savePolygon}
				disabled={isSaving || isIncomplete || !polygon || !!polygonError(polygon)}
				>{isSaving ? m.areaSaving() : m.areaSave()}</Button
			>
		</div>
		{#if saveError}<p
				role="alert"
				class="text-destructive text-sm"
			>
				{saveError}
			</p>{/if}
	{:else if mode === 'saved'}
		<label class="block space-y-2"
			><span class="text-sm">{m.areaSelect()}</span>
			<select
				data-testid="saved-area-select"
				class="border-input bg-background h-11 w-full rounded-md border px-3"
				value={selection.savedID ?? ''}
				onchange={(event) => (selection = { type: 'saved', savedID: event.currentTarget.value })}
			>
				<option value="">{m.areaSelect()}</option>
				{#if selection.savedID && saved.every((a) => a.id !== selection.savedID)}<option
						value={selection.savedID}>{selectedSaved?.name ?? selection.savedID}</option
					>{/if}
				{#each saved as area (area.id)}<option value={area.id}>{area.name}</option>{/each}
			</select>
		</label>
		{#if !isLoading && saved.length === 0}<p class="text-sm">{m.areaNone()}</p>{/if}
		<div class="flex items-center gap-2">
			<Button
				type="button"
				variant="outline"
				disabled={pageNumber <= 1}
				onclick={() => pageNumber--}>{m.areaPrevious()}</Button
			><span class="text-sm">{m.areaPage({ page: String(pageNumber) })}</span><Button
				type="button"
				variant="outline"
				disabled={pageNumber * 10 >= total}
				onclick={() => pageNumber++}>{m.areaNext()}</Button
			>
		</div>
		{#if selectedSaved}<PlayAreaMap
				readonly
				polygon={selectedSaved.polygon}
				{provider}
			/>{/if}
	{/if}
	<AreaCount
		{jwt}
		{provider}
		{rounds}
		{revision}
		incomplete={isIncomplete}
		{selection}
		bind:eligible
		bind:valid
	/>
	<a
		href={resolve('/(with-sidebar)/play-areas')}
		class="inline-block text-sm underline">{m.areaManage()}</a
	>
</fieldset>
