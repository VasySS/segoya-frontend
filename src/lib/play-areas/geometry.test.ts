import { describe, expect, it } from 'vitest';

import {
	areaSelectionSchema,
	closePolygon,
	isPayloadWithinLimit,
	polygonError,
	selectionKey
} from './geometry';

const vertices = (count: number) =>
	Array.from({ length: count }, (_, index) => {
		const angle = (index * 2 * Math.PI) / count;
		return [Math.cos(angle), Math.sin(angle)];
	});

describe('play area geometry', () => {
	it('keeps longitude first and closes a detached ring exactly once', () => {
		expect.hasAssertions();

		const input = [
			[37, 55],
			[38, 55],
			[38, 56]
		];
		const polygon = closePolygon(input);
		input[0]?.push(99);

		expect(polygon.coordinates).toStrictEqual([
			[
				[37, 55],
				[38, 55],
				[38, 56],
				[37, 55]
			]
		]);
		expect(closePolygon(polygon.coordinates[0] ?? [])).toStrictEqual(polygon);
		expect(polygonError(polygon)).toBeUndefined();
	});

	it.each([
		[
			[0, 0],
			[1, 1]
		],
		[
			[0, 0],
			[1, 1],
			[2, 2]
		],
		[
			[0, 0],
			[2, 2],
			[0, 2],
			[2, 0]
		],
		[
			[179, 0],
			[-179, 0],
			[179, 1]
		],
		[
			[181, 0],
			[1, 0],
			[1, 1]
		],
		[
			[0, 91],
			[1, 0],
			[1, 1]
		],
		[
			[NaN, 0],
			[1, 0],
			[1, 1]
		],
		[
			[0, 0],
			[1, 0],
			[1, 1],
			[1, 0]
		]
	])('rejects unsupported geometry %j', (...points) => {
		expect.hasAssertions();
		expect(polygonError(closePolygon(points))).toBeDefined();
	});

	it('accepts 500 vertices and rejects 501', () => {
		expect.hasAssertions();

		const maximum = closePolygon(vertices(500));
		const oversized = closePolygon(vertices(501));

		expect(polygonError(maximum)).toBeUndefined();
		expect(polygonError(oversized)).toBeDefined();
	});

	it('rejects holes and a ring without closure', () => {
		expect.hasAssertions();
		expect(
			polygonError({
				type: 'Polygon',
				coordinates: [
					[
						[0, 0],
						[1, 0],
						[1, 1],
						[0, 1]
					]
				]
			})
		).toBeDefined();
		expect(polygonError({ type: 'Polygon', coordinates: [[], []] })).toBeDefined();
	});

	it('defaults only an omitted selection and enforces mutually exclusive fields', () => {
		expect.hasAssertions();
		expect(areaSelectionSchema.parse(undefined)).toStrictEqual({ type: 'all' });
		expect(
			areaSelectionSchema.safeParse({
				type: 'all',
				presetIDs: ['0199027e-ade6-784d-9d43-cc9c776a6943']
			}).success
		).toBe(false);
		expect(areaSelectionSchema.safeParse({ type: 'saved' }).success).toBe(false);
		expect(areaSelectionSchema.safeParse({ type: 'presets', presetIDs: [] }).success).toBe(false);
		expect(areaSelectionSchema.safeParse({ type: 'unknown' }).success).toBe(false);
	});

	it('deduplicates count keys and separates providers', () => {
		expect.hasAssertions();
		expect(selectionKey('google', { type: 'presets', presetIDs: ['b', 'a', 'a'] })).toBe(
			selectionKey('google', { type: 'presets', presetIDs: ['a', 'b'] })
		);
		expect(selectionKey('yandex', { type: 'all' })).not.toBe(
			selectionKey('yandex_air', { type: 'all' })
		);
	});

	it('measures the entire serialized UTF-8 payload', () => {
		expect.hasAssertions();
		expect(isPayloadWithinLimit({ name: 'я'.repeat(32_768) })).toBe(false);
		expect(isPayloadWithinLimit({ type: 'all' })).toBe(true);
	});
});
