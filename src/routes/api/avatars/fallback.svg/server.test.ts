import { Avatar, Style } from '@dicebear/core';
import definition from '@dicebear/styles/shapes.json' with { type: 'json' };
import { describe, expect, it } from 'vitest';

import { GET } from './+server';

function getAvatar(seed: string | undefined, etag?: string) {
	const url = new URL('http://localhost/api/avatars/fallback.svg');
	if (seed !== undefined) url.searchParams.set('seed', seed);
	const request = new Request(url, { headers: etag ? { 'If-None-Match': etag } : {} });
	return GET({ url, request } as Parameters<typeof GET>[0]);
}

describe('fallback avatar endpoint', () => {
	it('preserves the original seeded SVG and makes it cacheable', async () => {
		expect.hasAssertions();

		const seed = 'Test / Игрок & <user>';
		const expected = new Avatar(new Style(definition), {
			seed,
			backgroundColor: ['63e46e', '33afd5', 'd85e92', 'fdd6b5', '904e32']
		}).toString();
		const response = await getAvatar(seed);

		expect(response.status).toBe(200);
		expect(response.headers.get('content-type')).toBe('image/svg+xml; charset=utf-8');
		expect(response.headers.get('cache-control')).toBe('public, max-age=86400');
		await expect(response.text()).resolves.toBe(expected);
	});

	it('returns a bodyless 304 for a matching weak or strong ETag', async () => {
		expect.hasAssertions();

		const initial = await getAvatar('cached-user');
		const etag = initial.headers.get('etag') ?? '';

		expect(etag).toHaveLength(66);

		const cached = await getAvatar('cached-user', `"other", W/${etag}`);

		expect(cached.status).toBe(304);
		await expect(cached.text()).resolves.toBe('');
	});

	it.each([undefined, 'a'.repeat(129)])('rejects an invalid seed', async (seed) => {
		expect.hasAssertions();
		await expect(Promise.try(() => getAvatar(seed))).rejects.toMatchObject({
			status: 400
		});
	});
});
