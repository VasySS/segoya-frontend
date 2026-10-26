<script lang="ts">
	import type { Polygon, PresetGeometry, Provider } from '#lib/api/openapi.js';
	import { closePolygon, polygonError } from '#lib/play-areas/geometry.js';
	import { m } from '#paraglide/messages.js';
	import type * as Leaflet from 'leaflet';
	import { onMount, untrack } from 'svelte';
	import Button from '#components/shadcn/button/button.svelte';

	import 'leaflet/dist/leaflet.css';
	import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';

	let {
		polygon = $bindable<Polygon | undefined>(),
		outlines = [],
		provider = 'google',
		readonly = false,
		incomplete = $bindable(false)
	}: {
		polygon?: Polygon | undefined;
		outlines?: PresetGeometry[];
		provider?: Provider;
		readonly?: boolean;
		incomplete?: boolean;
	} = $props();

	let container: HTMLDivElement;
	let map: Leaflet.Map | undefined;
	let L: typeof Leaflet;
	let shape: Leaflet.Polygon | undefined;
	let boundaryLayers: Leaflet.FeatureGroup | undefined;
	let isReady = $state(false);
	let isFailed = $state(false);
	let isTileFailed = $state(false);
	let isDrawing = $state(false);
	let isEditing = $state(false);
	let vertices = $state<number[][]>([]);
	let previous: Polygon | undefined;
	let error = $state('');
	let coordinates = $state('');
	let isShowCoordinates = $state(false);
	let initialize: (() => void) | undefined;

	onMount(() => {
		let isDestroyed = false;
		let observer: ResizeObserver | undefined;

		initialize = () => {
			isFailed = false;

			void (async () => {
				try {
					L = await import('leaflet');
					await import('@geoman-io/leaflet-geoman-free');

					const { createTileLayer } = await import('#components/minimap/leafletLayers.js');
					const { positionMap } = await import('#components/minimap/leafletUtils.js');
					if (isDestroyed) return;

					map?.remove();
					map = L.map(container, { worldCopyJump: false });

					positionMap(map, provider);
					createTileLayer('default')
						.on('tileerror', () => {
							isTileFailed = true;
						})
						.addTo(map);

					boundaryLayers = L.featureGroup().addTo(map);
					map.on('click', (event: Leaflet.LeafletMouseEvent) => {
						if (!isDrawing || vertices.length >= 500) return;
						vertices = [...vertices, [event.latlng.lng, event.latlng.lat]];
					});
					observer?.disconnect();
					observer = new ResizeObserver(() => map?.invalidateSize());
					observer.observe(container);
					isReady = true;
				} catch {
					if (!isDestroyed) isFailed = true;
				}
			})();
		};

		initialize();

		return () => {
			isDestroyed = true;
			observer?.disconnect();
			map?.off();
			map?.remove();
		};
	});

	function renderShape(
		value: Polygon | undefined,
		points: number[][],
		isDrawing: boolean,
		isEditing: boolean
	) {
		if (!map) return;
		shape?.off();
		shape?.remove();

		const ring = isDrawing ? points : value?.coordinates[0];
		shape = undefined;
		if (!ring?.length) return;
		shape = L.polygon(
			ring.map((p) => [p[1], p[0]] as Leaflet.LatLngTuple),
			{ pmIgnore: readonly || isDrawing }
		).addTo(map);
		if (!isEditing || readonly || isDrawing) return;

		shape.pm.enable({ allowSelfIntersection: false, removeLayerBelowMinVertexCount: false });
		map.eachLayer((layer) => {
			if (layer instanceof L.Marker) layer.getElement()?.setAttribute('aria-label', m.areaEdit());
		});

		const update = () => {
			if (!shape) return;
			const ring = shape.getLatLngs()[0] as Leaflet.LatLng[];
			const next = closePolygon(ring.map((p) => [p.lng, p.lat]));
			error = polygonError(next) ?? '';
			polygon = next;
		};
		shape.on('pm:markerdragend pm:vertexadded pm:vertexremoved', update);
	}

	$effect(() => {
		if (!isReady) return;

		const value = polygon,
			points = vertices,
			isDrawingNow = isDrawing,
			isEditingNow = isEditing;

		untrack(() => {
			renderShape(value, points, isDrawingNow, isEditingNow);
		});
	});

	$effect(() => {
		if (!isReady || !boundaryLayers || !map) return;

		const values = outlines,
			group = boundaryLayers;

		untrack(() => {
			boundaryLayers?.clearLayers();
			for (const geometry of values) {
				L.geoJSON(geometry, { pmIgnore: true, style: { weight: 2 } }).addTo(group);
			}

			if (boundaryLayers?.getLayers().length) {
				map?.fitBounds(boundaryLayers.getBounds(), { maxZoom: 12, padding: [15, 15] });
			}
		});
	});

	$effect(() => {
		if (isDrawing || isEditing || !isReady || !polygon) {
			return;
		}

		const value = polygon;
		untrack(() => {
			const ring = value.coordinates[0];
			if (ring?.length) {
				map?.fitBounds(L.latLngBounds(ring.map((p) => [p[1], p[0]] as Leaflet.LatLngTuple)), {
					maxZoom: 12,
					padding: [15, 15]
				});
			}
		});
	});

	const hasDraft = $derived(isDrawing || isEditing || isShowCoordinates || !!error);

	$effect(() => {
		if (incomplete !== hasDraft) incomplete = hasDraft;
	});

	function start() {
		previous = polygon ? structuredClone($state.snapshot(polygon)) : undefined;
		vertices = [];
		error = '';
		isEditing = false;
		isDrawing = true;
	}

	function finish() {
		const value = isDrawing ? closePolygon($state.snapshot(vertices)) : polygon;
		if (!value) return;
		error = polygonError(value) ?? '';
		if (error) return;
		polygon = value;
		isDrawing = false;
		isEditing = false;
	}

	function applyCoordinates() {
		const points = coordinates
			.trim()
			.split('\n')
			.map((line) =>
				line
					.trim()
					.split(/[,\s]+/)
					.map(Number)
			);

		const next = closePolygon(points);

		error = polygonError(next) ?? '';
		if (error) return;

		polygon = next;
		isDrawing = false;
		isEditing = false;
		isShowCoordinates = false;
	}

	function toggleCoordinates() {
		if (!isShowCoordinates) {
			coordinates =
				polygon?.coordinates[0]
					?.slice(0, -1)
					.map((p) => p.join(', '))
					.join('\n') ?? '';
		}

		isShowCoordinates = !isShowCoordinates;
		error = '';
	}
</script>

<div class="space-y-3 [&_button]:min-h-11">
	{#if !readonly}
		<p class="text-muted-foreground text-sm">{m.areaDrawingHelp()}</p>
		<div class="flex flex-wrap gap-2">
			<Button
				type="button"
				variant="outline"
				onclick={start}
				disabled={!isReady || isDrawing || isEditing}
			>
				{m.areaDraw()}
			</Button>

			{#if isDrawing || isEditing}
				<Button
					type="button"
					onclick={finish}
				>
					{m.areaFinish()}
				</Button>

				{#if isDrawing}<Button
						type="button"
						variant="outline"
						onclick={() => (vertices = vertices.slice(0, -1))}
					>
						{m.areaUndo()}
					</Button>
				{/if}

				<Button
					type="button"
					variant="outline"
					onclick={() => {
						polygon = previous;
						isDrawing = false;
						isEditing = false;
						error = '';
					}}
				>
					{m.areaCancel()}
				</Button>
			{:else if polygon}
				<Button
					type="button"
					variant="outline"
					onclick={() => {
						previous = structuredClone($state.snapshot(polygon));
						isEditing = true;
					}}
				>
					{m.areaEdit()}
				</Button>
			{/if}

			<Button
				type="button"
				variant="outline"
				onclick={() => {
					polygon = undefined;
					vertices = [];
					isDrawing = false;
					isEditing = false;
					error = '';
				}}
			>
				{m.areaClear()}
			</Button>
		</div>
	{/if}

	{#if !isReady && !isFailed}
		<p role="status">{m.areaMapLoading()}</p>
	{/if}

	{#if isFailed}
		<p role="alert">
			{m.areaMapFailed()}
		</p>

		<Button
			type="button"
			onclick={() => {
				initialize?.();
			}}
		>
			{m.areaRetry()}
		</Button>
	{/if}

	<div
		bind:this={container}
		data-testid="play-area-map"
		class="relative isolate h-80 w-full rounded-md border sm:h-96"
		aria-label={m.playArea()}
	></div>

	{#if isTileFailed}
		<p class="text-muted-foreground text-sm">
			{m.areaTileFailed()}
		</p>
	{/if}

	{#if error}<p
			class="text-destructive text-sm"
			role="alert"
		>
			{error}
		</p>
	{/if}

	{#if !readonly}
		<Button
			type="button"
			variant="ghost"
			onclick={toggleCoordinates}
		>
			{m.areaCoordinates()}
		</Button>

		{#if isShowCoordinates}
			<label class="block space-y-2">
				<span class="text-sm">{m.areaCoordinatesHelp()}</span>
				<textarea
					data-testid="area-coordinates"
					class="border-input bg-background min-h-36 w-full rounded-md border p-3 font-mono text-sm"
					bind:value={coordinates}
					aria-label={m.areaCoordinates()}></textarea>
			</label>
			<Button
				type="button"
				onclick={applyCoordinates}
			>
				{m.areaApplyCoordinates()}
			</Button>
			<Button
				type="button"
				variant="outline"
				onclick={() => {
					isShowCoordinates = false;
					error = '';
				}}
			>
				{m.areaCancel()}
			</Button>
		{/if}
	{/if}
</div>
