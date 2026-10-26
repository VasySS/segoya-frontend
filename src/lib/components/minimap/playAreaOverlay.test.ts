import { fetchBackend } from '#lib/api/base.js';
import type { PlayAreaPreset, Polygon, PresetGeometry } from '#lib/api/openapi.js';
import L from 'leaflet';
import { describe, expect, it, vi } from 'vitest';

import { setTileLayer } from './leafletLayers';
import { addPlayAreaOverlay, loadPlayAreaOutlines } from './playAreaOverlay';

vi.hoisted(() => {
	// Leaflet detects SVG support with this browser method, which jsdom omits.
	Object.defineProperty(SVGSVGElement.prototype, 'createSVGRect', {
		value: () => ({}),
		configurable: true
	});
});
vi.mock(import('#lib/api/base.js'));

const polygon: Polygon = {
	type: 'Polygon',
	coordinates: [
		[
			[-10, 30],
			[40, 30],
			[40, 65],
			[-10, 65],
			[-10, 30]
		]
	]
};
const multipart: PresetGeometry = { type: 'MultiPolygon', coordinates: [polygon.coordinates] };
const presetResponse = (id: string) => ({
	success: true as const,
	data: {
		id,
		name: id,
		kind: 'country',
		countryCode: 'XX',
		version: '1',
		source: 'Source',
		license: 'License',
		attribution: 'Credits',
		providers: ['google'],
		bounds: [-10, 30, 40, 65],
		polygon: multipart
	} satisfies PlayAreaPreset,
	headers: undefined
});

describe('in-game play-area overlays', () => {
	it('uses applied polygon snapshots without reading their saved source', async () => {
		expect.hasAssertions();

		vi.mocked(fetchBackend).mockReset();
		const signal = new AbortController().signal;

		await expect(
			loadPlayAreaOutlines({ type: 'polygon', polygon }, 'jwt', signal)
		).resolves.toStrictEqual([{ geometry: polygon }]);
		await expect(loadPlayAreaOutlines({ type: 'all' }, 'jwt', signal)).resolves.toStrictEqual([]);
		await expect(loadPlayAreaOutlines(undefined, 'jwt', signal)).resolves.toStrictEqual([]);
		expect(fetchBackend).not.toHaveBeenCalled();
	});

	it('loads every selected multipart preset with cancellation and source credits', async () => {
		expect.hasAssertions();

		vi.mocked(fetchBackend)
			.mockReset()
			.mockResolvedValueOnce(presetResponse('first'))
			.mockResolvedValueOnce(presetResponse('second'));
		const signal = new AbortController().signal;
		const outlines = await loadPlayAreaOutlines(
			{ type: 'presets', presetIDs: ['first', 'second', 'first'] },
			'jwt',
			signal
		);

		expect(fetchBackend).toHaveBeenCalledTimes(2);
		expect(fetchBackend).toHaveBeenCalledWith(
			'jwt',
			'get',
			'/v1/play-areas/presets/{id}',
			{ path: { id: 'first' } },
			{ signal }
		);
		expect(fetchBackend).toHaveBeenCalledWith(
			'jwt',
			'get',
			'/v1/play-areas/presets/{id}',
			{ path: { id: 'second' } },
			{ signal }
		);
		expect(outlines).toStrictEqual([
			{ geometry: multipart, attribution: 'Source · Credits · License' },
			{ geometry: multipart, attribution: 'Source · Credits · License' }
		]);
	});

	it('discards preset responses that arrive after the minimap is destroyed', async () => {
		expect.hasAssertions();

		vi.mocked(fetchBackend).mockReset();
		const pending = Promise.withResolvers<ReturnType<typeof presetResponse>>();
		vi.mocked(fetchBackend).mockReturnValueOnce(pending.promise);
		const abort = new AbortController();
		const load = loadPlayAreaOutlines(
			{ type: 'presets', presetIDs: ['first'] },
			'jwt',
			abort.signal
		);
		abort.abort();
		pending.resolve(presetResponse('first'));

		await expect(load).rejects.toMatchObject({ name: 'AbortError' });
	});

	it('keeps the boundary and guess clicks when base tiles change, and cleans up credits', () => {
		expect.hasAssertions();

		const container = document.createElement('div');
		document.body.append(container);
		const map = L.map(container).setView([50, 12], 4);
		try {
			const marker = L.circleMarker([50, 12]).addTo(map);
			const group = addPlayAreaOverlay(map, [
				{ geometry: multipart, attribution: 'Boundary <source>' }
			]);

			expect(group?.getBounds().getSouthWest()).toStrictEqual(L.latLng(30, -10));
			expect(group?.getBounds().getNorthEast()).toStrictEqual(L.latLng(65, 40));
			expect(map.getPane('play-area')?.style.pointerEvents).toBe('none');

			const boundary = container.querySelector('.minimap-play-area-boundary');

			expect(boundary).not.toHaveClass('leaflet-interactive');

			const guess = vi.fn<(event: L.LeafletMouseEvent) => void>();
			map.on('click', guess);
			boundary?.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 50, clientY: 50 }));

			expect(guess).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ type: 'click' }));

			setTileLayer(map, 'default');
			setTileLayer(map, 'esri');

			expect(group?.getLayers().every((layer) => map.hasLayer(layer))).toBe(true);
			expect(container.querySelector('.leaflet-control-attribution')?.textContent).toContain(
				'Boundary <source>'
			);

			group?.remove();

			expect(container.querySelector('.minimap-play-area-boundary')).toBeNull();
			expect(container.querySelector('.leaflet-control-attribution')?.textContent).not.toContain(
				'Boundary <source>'
			);
			expect(map.hasLayer(marker)).toBe(true);
		} finally {
			map.remove();
			container.remove();
		}
	});
});
