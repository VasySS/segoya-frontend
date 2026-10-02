import { File as NodeFile } from 'node:buffer';
import type { RequestEvent } from '@sveltejs/kit';
import { newDiscordOAuth, newYandexOAuth } from '#lib/api/auth.js';
import { fetchBackend } from '#lib/api/base.js';
import { updateUserAvatar } from '#lib/api/users.js';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { avatarSchema, formSchema } from './(components)/(account-tab)/schema';
import { actions } from './+page.server';

vi.mock(import('#lib/api/auth.js'));
vi.mock(import('#lib/api/base.js'));
vi.mock(import('#lib/api/users.js'));
vi.mock(import('sveltekit-superforms'), async (importOriginal) => {
	const actual = await importOriginal();
	return {
		...actual,
		superValidate: vi.fn<typeof actual.superValidate>(
			actual.superValidate
		) as unknown as typeof actual.superValidate
	};
});

describe('profile updates', () => {
	// eslint-disable-next-line vitest/no-hooks
	afterEach(() => vi.clearAllMocks());

	const event = { locals: { jwtToken: 'token' } } as RequestEvent;

	it('redirects a successful name update directly to the profile', async () => {
		expect.hasAssertions();

		const form = await superValidate({ name: 'New Name' }, zod4(formSchema));
		vi.mocked(superValidate).mockResolvedValueOnce(form);
		vi.mocked(fetchBackend).mockResolvedValueOnce({
			success: true,
			data: undefined,
			headers: undefined
		});

		await expect(actions.update?.(event)).rejects.toMatchObject({
			status: 303,
			location: '/profile'
		});
		expect(fetchBackend).toHaveBeenCalledWith('token', 'patch', '/v1/users/me', {
			body: { name: 'New Name' }
		});
	});

	it('retains the failure status and name field error', async () => {
		expect.hasAssertions();

		const form = await superValidate({ name: 'New Name' }, zod4(formSchema));
		vi.mocked(superValidate).mockResolvedValueOnce(form);
		vi.mocked(fetchBackend).mockResolvedValueOnce({
			success: false,
			error: { status: 500, title: 'Error', detail: 'Name rejected' }
		});

		await expect(actions.update?.(event)).resolves.toMatchObject({
			status: 400,
			data: { form: { errors: { name: ['Name rejected'] } } }
		});
	});

	it('rejects invalid fields without contacting the backend', async () => {
		expect.hasAssertions();

		const form = await superValidate({ name: 'x' }, zod4(formSchema));
		vi.mocked(superValidate).mockResolvedValueOnce(form);

		await expect(actions.update?.(event)).resolves.toMatchObject({
			status: 400,
			data: { form: { valid: false } }
		});
		expect(fetchBackend).not.toHaveBeenCalled();
	});

	it('redirects a successful avatar update directly to the profile', async () => {
		expect.hasAssertions();

		const form = await superValidate(zod4(avatarSchema));
		form.data.userAvatar = new NodeFile(['image'], 'avatar.webp', {
			type: 'image/webp'
		}) as unknown as File;
		form.valid = true;
		vi.mocked(superValidate).mockResolvedValueOnce(form);
		vi.mocked(updateUserAvatar).mockResolvedValueOnce(new Response(undefined, { status: 204 }));

		await expect(actions.update_avatar?.(event)).rejects.toMatchObject({
			status: 303,
			location: '/profile'
		});
	});

	it('retains the avatar field error on a failed upload', async () => {
		expect.hasAssertions();

		const form = await superValidate(zod4(avatarSchema));
		form.data.userAvatar = new NodeFile(['image'], 'avatar.webp', {
			type: 'image/webp'
		}) as unknown as File;
		form.valid = true;
		vi.mocked(superValidate).mockResolvedValueOnce(form);
		vi.mocked(updateUserAvatar).mockResolvedValueOnce(
			Response.json({ status: 500, title: 'Error', detail: 'Avatar rejected' }, { status: 500 })
		);

		await expect(actions.update_avatar?.(event)).resolves.toMatchObject({
			status: 400,
			data: { form: { errors: { userAvatar: ['Avatar rejected'] } } }
		});
	});
});

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
