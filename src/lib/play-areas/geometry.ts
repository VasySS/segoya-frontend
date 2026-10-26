import { PlayAreaSelection, type Polygon } from '#lib/api/openapi.js';
import { m } from '#paraglide/messages.js';

export type Coordinate = [number, number];
export const MAX_PAYLOAD_BYTES = 64 * 1024;

export function closePolygon(vertices: number[][]): Polygon {
	const ring = vertices.map((point) => [...point]);
	const first = ring[0];
	const last = ring.at(-1);

	if (first && (first[0] !== last?.[0] || first[1] !== last?.[1])) {
		ring.push([...first]);
	}

	return { type: 'Polygon', coordinates: [ring] };
}

function cross(a: Coordinate, b: Coordinate, c: Coordinate): number {
	return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
}

function isOnSegment(a: Coordinate, b: Coordinate, p: Coordinate, c: number): boolean {
	return (
		c === 0 &&
		p[0] >= Math.min(a[0], b[0]) &&
		p[0] <= Math.max(a[0], b[0]) &&
		p[1] >= Math.min(a[1], b[1]) &&
		p[1] <= Math.max(a[1], b[1])
	);
}

function hasIntersection(a: Coordinate, b: Coordinate, c: Coordinate, d: Coordinate): boolean {
	const x = cross(a, b, c),
		y = cross(a, b, d),
		z = cross(c, d, a),
		w = cross(c, d, b);

	return (
		(((x > 0 && y < 0) || (x < 0 && y > 0)) && ((z > 0 && w < 0) || (z < 0 && w > 0))) ||
		isOnSegment(a, b, c, x) ||
		isOnSegment(a, b, d, y) ||
		isOnSegment(c, d, a, z) ||
		isOnSegment(c, d, b, w)
	);
}

export function polygonError(polygon: Polygon): string | undefined {
	if (polygon.coordinates.length !== 1) return m.areaPolygonRing();

	const rawRing = polygon.coordinates[0];
	if (!rawRing || rawRing.length < 4 || rawRing.length > 501) return m.areaVertexLimit();

	if (
		rawRing.some(
			(p) =>
				p.length !== 2 ||
				!Number.isFinite(p[0]) ||
				!Number.isFinite(p[1]) ||
				typeof p[0] !== 'number' ||
				typeof p[1] !== 'number' ||
				Math.abs(p[0]) > 180 ||
				Math.abs(p[1]) > 90
		)
	) {
		return m.areaCoordinatesInvalid();
	}

	const ring = rawRing as Coordinate[];
	const first = ring[0];
	if (!first || first[0] !== ring.at(-1)?.[0] || first[1] !== ring.at(-1)?.[1]) {
		return m.areaPolygonRing();
	}

	const vertices = ring.slice(0, -1);
	if (new Set(vertices.map((p) => JSON.stringify(p))).size !== vertices.length) {
		return m.areaDistinctVertices();
	}

	let area = 0;
	for (let i = 0; i < ring.length - 1; i++) {
		const a = ring[i],
			b = ring[i + 1];
		if (!a || !b) continue;
		if (Math.abs(a[0] - b[0]) > 180) return m.areaAntimeridian();

		area += a[0] * b[1] - b[0] * a[1];

		for (let j = i + 2; j < ring.length - 1; j++) {
			if (i === 0 && j === ring.length - 2) continue;

			const c = ring[j],
				d = ring[j + 1];

			if (c && d && hasIntersection(a, b, c, d)) return m.areaSelfIntersection();
		}
	}

	return area === 0 ? m.areaZeroSize() : undefined;
}

export function isPayloadWithinLimit(value: unknown): boolean {
	return new TextEncoder().encode(JSON.stringify(value)).length <= MAX_PAYLOAD_BYTES;
}

export const areaSelectionSchema = PlayAreaSelection.superRefine((value, ctx) => {
	const expected: string[] = {
		all: [],
		presets: ['presetIDs'],
		polygon: ['polygon'],
		saved: ['savedID']
	}[value.type];

	const fields = ['presetIDs', 'polygon', 'savedID'] as const;

	if (fields.some((key) => expected.includes(key) !== (value[key] !== undefined))) {
		ctx.addIssue({ code: 'custom', message: m.areaSelectionInvalid() });
	}

	if (value.type !== 'polygon' || !value.polygon) return;

	const error = polygonError(value.polygon);
	if (error) ctx.addIssue({ code: 'custom', message: error });
}).default({ type: 'all' });

export function selectionKey(provider: string, area: PlayAreaSelection): string {
	return JSON.stringify([
		provider,
		area.type === 'presets'
			? {
					type: area.type,
					presetIDs: [...new Set(area.presetIDs)].toSorted((a, b) => a.localeCompare(b))
				}
			: area
	]);
}

export function normalizeArea(area?: PlayAreaSelection): PlayAreaSelection {
	return area === undefined ? { type: 'all' } : structuredClone(area);
}
