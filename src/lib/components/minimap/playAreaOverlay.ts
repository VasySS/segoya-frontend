import { fetchBackend } from '#lib/api/base.js';
import type { PlayAreaSelection, Polygon, PresetGeometry } from '#lib/api/openapi.js';
import { m } from '#paraglide/messages.js';
import L from 'leaflet';

export interface PlayAreaOutline {
	geometry: Polygon | PresetGeometry;
	attribution?: string;
}

export async function loadPlayAreaOutlines(
	selection: PlayAreaSelection | undefined,
	jwt: string,
	signal: AbortSignal
): Promise<PlayAreaOutline[]> {
	signal.throwIfAborted();

	if (!selection || selection.type === 'all') return [];
	if (selection.type === 'polygon' && selection.polygon) return [{ geometry: selection.polygon }];
	if (selection.type !== 'presets' || !selection.presetIDs?.length) {
		throw new Error('The applied play area has no boundary.');
	}

	const outlines: PlayAreaOutline[] = [];
	const ids = [...new Set(selection.presetIDs)];
	// Keep large preset downloads bounded, including games with many selected regions.
	for (let offset = 0; offset < ids.length; offset += 4) {
		const responses = await Promise.all(
			ids
				.slice(offset, offset + 4)
				.map((id) =>
					fetchBackend(jwt, 'get', '/v1/play-areas/presets/{id}', { path: { id } }, { signal })
				)
		);

		signal.throwIfAborted();

		for (const response of responses) {
			if (!response.success || !response.data.polygon) {
				throw new Error('Could not load an applied preset boundary.');
			}

			const preset = response.data;
			outlines.push({
				geometry: response.data.polygon,
				attribution: `${preset.source} · ${preset.attribution} · ${preset.license}`
			});
		}
	}

	return outlines;
}

export function addPlayAreaOverlay(
	map: L.Map,
	outlines: PlayAreaOutline[]
): L.FeatureGroup | undefined {
	if (outlines.length === 0) return;

	const paneName = 'play-area';
	const pane = map.getPane(paneName) ?? map.createPane(paneName);
	// Above tiles, below guess lines and markers. The area never intercepts a guess click.
	pane.style.zIndex = '350';
	pane.style.pointerEvents = 'none';
	const group = L.featureGroup().addTo(map);

	for (const { geometry } of outlines) {
		const options = { pane: paneName, interactive: false, pmIgnore: true };

		L.geoJSON(geometry, {
			...options,
			style: {
				className: 'minimap-play-area-halo',
				color: '#ffffff',
				weight: 6,
				opacity: 0.95,
				fill: false
			}
		}).addTo(group);

		L.geoJSON(geometry, {
			...options,
			style: {
				className: 'minimap-play-area-boundary',
				color: '#2563eb',
				weight: 3,
				opacity: 1,
				fillColor: '#2563eb',
				fillOpacity: 0.08
			}
		}).addTo(group);
	}

	const credits = [...new Set(outlines.map((o) => o.attribution).filter(Boolean))].join('; ');
	if (credits) {
		const escapedCredits = credits
			.replaceAll('&', '&amp;')
			.replaceAll('<', '&lt;')
			.replaceAll('>', '&gt;');

		const attribution = `<details class="minimap-play-area-attribution"><summary>${m.areaAttribution()}</summary>${escapedCredits}</details>`;
		map.attributionControl.addAttribution(attribution);
		group.on('remove', () => map.attributionControl.removeAttribution(attribution));
	}

	return group;
}
