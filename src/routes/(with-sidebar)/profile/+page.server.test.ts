import type { RequestEvent } from '@sveltejs/kit';
import { newDiscordOAuth, newYandexOAuth } from '#lib/api/auth.js';
import { describe, expect, it, vi } from 'vitest';

import { actions } from './+page.server';

vi.mock(import('#lib/api/auth.js'));

describe('oAuth account linking', () => {
	it.each([
		{
			action: 'add_yandex',
			provider: newYandexOAuth,
			location: 'https://oauth.yandex.ru/authorize'
		},
		{
			action: 'add_discord',
			provider: newDiscordOAuth,
			location: 'https://discord.com/oauth2/authorize'
		}
	])('allows the external redirect for $action', async ({ action, provider, location }) => {
		expect.hasAssertions();

		vi.mocked(provider).mockResolvedValue(
			new Response(undefined, {
				status: 307,
				headers: {
					Location: location,
					'Set-Cookie': 'oauth_state=state; Path=/; HttpOnly'
				}
			})
		);
		const setCookie = vi.fn<RequestEvent['cookies']['set']>();
		const event = {
			cookies: {
				get: vi.fn<RequestEvent['cookies']['get']>(() => 'test-token'),
				set: setCookie
			}
		} as unknown as RequestEvent;

		await expect(actions[action]?.(event)).rejects.toMatchObject({ status: 303, location });
		expect(provider).toHaveBeenCalledWith('test-token');
		expect(setCookie).toHaveBeenCalledWith('oauth_state', 'state', { path: '/', httpOnly: true });
	});
});
