import { describe, expect, it } from 'vitest';

import { getAvatarSource } from './helpers';

describe('avatar sources', () => {
	it('keeps uploaded avatars on the configured image host', () => {
		expect.hasAssertions();
		expect(getAvatarSource('hash.webp', 'player')).toBe('/hash.webp');
	});

	it('encodes fallback seeds as a same-origin image URL', () => {
		expect.hasAssertions();

		const username = 'Игрок / &?#';
		const url = new URL(getAvatarSource('', username), 'http://localhost');

		expect(url.pathname).toBe('/api/avatars/fallback.svg');
		expect(url.searchParams.get('seed')).toBe(username);
	});
});
