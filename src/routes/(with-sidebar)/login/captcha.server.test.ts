import { fetchBackend } from '#lib/api/base.js';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { actions as registerActions } from '../register/+page.server.js';
import { actions as loginActions } from './+page.server.js';

const config = vi.hoisted(() => ({ enabled: true }));
vi.mock(import('#lib/captcha/config.js'), () => ({
	captchaConfig: { provider: 'turnstile' as const, siteKey: 'key' },
	get captchaEnabled() {
		return config.enabled;
	}
}));
vi.mock(import('#lib/api/base.js'));

function event(
	token: string,
	login = 'test-user'
): Parameters<NonNullable<typeof loginActions.default_auth>>[0] {
	const data = new FormData();
	for (const [key, value] of Object.entries({
		captcha: token,
		login,
		password: 'password',
		passwordAgain: 'password',
		name: 'Test User'
	}))
		data.set(key, value);
	return {
		request: new Request('https://example.com/login', {
			method: 'POST',
			headers: { 'User-Agent': 'captcha-test' },
			body: data
		})
	} as Parameters<NonNullable<typeof loginActions.default_auth>>[0];
}

describe.each([
	{ page: 'login', action: loginActions.default_auth, endpoint: '/v1/auth/login' },
	{ page: 'register', action: registerActions.default, endpoint: '/v1/auth/register' }
])('$page CAPTCHA submissions', ({ action, endpoint }) => {
	// eslint-disable-next-line vitest/no-hooks
	afterEach(() => {
		vi.resetAllMocks();
		config.enabled = true;
	});

	it.each(['', ' '.repeat(3)])(
		'rejects missing or blank tokens before calling the backend',
		async (token) => {
			expect.hasAssertions();

			const result = await action?.(event(token));

			expect(result).toMatchObject({ status: 400, data: { form: { valid: false } } });
			expect(fetchBackend).not.toHaveBeenCalled();
		}
	);

	it('returns other invalid fields before calling the backend', async () => {
		expect.hasAssertions();

		const result = await action?.(event('token', 'a'));

		expect(result).toMatchObject({ status: 400, data: { form: { valid: false } } });
		expect(fetchBackend).not.toHaveBeenCalled();
	});

	it('forwards a verified token in the existing header', async () => {
		expect.hasAssertions();

		vi.mocked(fetchBackend).mockResolvedValueOnce({
			success: false,
			error: { title: 'Rejected', status: 400, detail: 'Try again' }
		});
		await action?.(event('verified-token'));

		expect(vi.mocked(fetchBackend).mock.calls[0]).toMatchObject([
			'',
			'post',
			endpoint,
			{
				header: { 'Frontend-Captcha-Token': 'verified-token' },
				body: { username: 'test-user', password: 'password' }
			}
		]);
	});

	it('retains the existing no-key development submission flow', async () => {
		expect.hasAssertions();

		config.enabled = false;
		vi.mocked(fetchBackend).mockResolvedValueOnce({
			success: false,
			error: { title: 'Rejected', status: 400, detail: 'Try again' }
		});
		await action?.(event(''));

		expect(vi.mocked(fetchBackend).mock.calls[0]).toMatchObject([
			'',
			'post',
			endpoint,
			{
				header: { 'Frontend-Captcha-Token': '' },
				body: { username: 'test-user' }
			}
		]);
	});
});
