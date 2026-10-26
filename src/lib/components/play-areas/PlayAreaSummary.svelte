<script lang="ts">
	import { fetchBackend } from '#lib/api/base.js';
	import type { PlayAreaPreset, PlayAreaSelection, Provider } from '#lib/api/openapi.js';
	import { m } from '#paraglide/messages.js';
	import Button from '#components/shadcn/button/button.svelte';

	import PlayAreaMap from './PlayAreaMap.svelte';

	let {
		selection,
		provider,
		jwt
	}: { selection?: PlayAreaSelection | undefined; provider: Provider; jwt: string } = $props();

	let presets = $state<PlayAreaPreset[]>([]);
	let outlines = $state<PlayAreaPreset[]>([]);
	let isPreview = $state(false);
	let error = $state('');

	const type = $derived(selection?.type ?? 'all');
	const label = $derived.by(() => {
		switch (type) {
			case 'all': {
				return m.areaAll();
			}
			case 'polygon': {
				return m.areaSnapshot();
			}
			case 'presets': {
				return presets.map((p) => p.name).join(', ') || m.areaPresets();
			}
			default: {
				return m.areaUnknown();
			}
		}
	});

	$effect(() => {
		const ids = selection?.type === 'presets' ? (selection.presetIDs ?? []) : [];
		presets = [];
		error = '';
		if (ids.length === 0) return;

		const abort = new AbortController();
		void fetchBackend(
			jwt,
			'get',
			'/v1/play-areas/presets',
			{ query: { provider } },
			{ signal: abort.signal }
		)
			.then((response) => {
				if (abort.signal.aborted) return;
				if (!response.success) {
					error = response.error.detail;
					return;
				}
				presets = response.data.filter((preset) => ids.includes(preset.id));
				if (presets.length !== ids.length) error = m.areaRequestFailed();
			})
			.catch(() => {
				if (!abort.signal.aborted) error = m.areaRequestFailed();
			});

		return () => {
			abort.abort();
		};
	});

	$effect(() => {
		const ids = selection?.type === 'presets' ? (selection.presetIDs ?? []) : [];
		outlines = [];
		if (!isPreview || ids.length === 0) return;
		const abort = new AbortController();

		void (async () => {
			try {
				// Bound parallel outline downloads; immutable source geometry can be large.
				for (let offset = 0; offset < ids.length; offset += 4) {
					const responses = await Promise.all(
						ids
							.slice(offset, offset + 4)
							.map((id) =>
								fetchBackend(
									jwt,
									'get',
									'/v1/play-areas/presets/{id}',
									{ path: { id } },
									{ signal: abort.signal }
								)
							)
					);
					if (abort.signal.aborted) return;
					outlines = [...outlines, ...responses.filter((r) => r.success).map((r) => r.data)];
				}
			} catch {
				if (!abort.signal.aborted) error = m.areaRequestFailed();
			}
		})();

		return () => {
			abort.abort();
		};
	});
</script>

<div class="space-y-2 text-sm">
	<p><span class="text-muted-foreground">{m.playArea()}:</span> {label}</p>
	{#if error}<p class="text-destructive">{error}</p>{/if}
	{#if type === 'polygon' || type === 'presets'}
		<Button
			type="button"
			size="sm"
			variant="outline"
			onclick={() => (isPreview = !isPreview)}>{m.areaPreview()}</Button
		>

		{#if isPreview}
			<PlayAreaMap
				readonly
				{provider}
				polygon={type === 'polygon' ? selection?.polygon : undefined}
				outlines={outlines.map((p) => p.polygon).filter((p) => p !== undefined)}
			/>
			{#each presets as preset (preset.id)}
				<p class="text-muted-foreground text-xs">
					{m.areaAttribution()}: {preset.source} · {preset.attribution} · {preset.license}
				</p>
			{/each}
		{/if}
	{/if}
</div>
