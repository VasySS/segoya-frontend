import type { Cookies, RequestEvent } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit/hooks';
import { accessCookieName, refreshCookieName } from '#lib/api/auth.js';
import { fetchBackend } from '#lib/api/base.js';
import type { JwtPayload } from '#lib/types/auth.js';
import { describe, expect, it, vi } from 'vitest';

import { authHandle } from './hooks.server.js';

vi.mock(import('#lib/api/base.js'));

interface CookieJar {
	cookies: Cookies;
	deleteCookie: ReturnType<typeof vi.fn>;
}

const user: Omit<JwtPayload, 'exp'> = {
	userID: '00000000-0000-0000-0000-000000000001',
	username: 'test-user',
	name: 'Test User',
	sessionID: '00000000-0000-0000-0000-000000000002'
};

function createToken(expiresAt: number) {
	// eslint-disable-next-line unicorn/prefer-uint8array-base64
	const payload = btoa(JSON.stringify({ ...user, exp: expiresAt }));
	return `header.${payload}.signature`;
}

function createCookieJar(initial: Record<string, string> = {}): CookieJar {
	const values = new Map(Object.entries(initial));
	const deleteCookie = vi.fn<Cookies['delete']>((name) => {
		values.delete(name);
	});
	const setCookie = vi.fn<Cookies['set']>((name, value, options) => {
		if (options?.maxAge === 0) {
			values.delete(name);
			return;
		}

		values.set(name, value);
	});

	return {
		cookies: {
			get: vi.fn<Cookies['get']>((name) => values.get(name)),
			getAll: vi.fn<Cookies['getAll']>(() => [...values].map(([name, value]) => ({ name, value }))),
			set: setCookie,
			delete: deleteCookie,
			serialize: vi.fn<Cookies['serialize']>(),
			parse: vi.fn<Cookies['parse']>()
		},
		deleteCookie
	};
}

function createHandleInput(pathname: string, cookies: Cookies) {
	const url = new URL(pathname, 'http://localhost:5173');
	const event = {
		cookies,
		locals: {},
		request: new Request(url),
		url
	} as unknown as RequestEvent;
	const resolve = vi.fn<Parameters<Handle>[0]['resolve']>(() =>
		Promise.resolve(new Response('resolved'))
	);

	return {
		event,
		resolve,
		input: { event, resolve } as Parameters<Handle>[0]
	};
}

function expectAuthCookiesCleared(deleteCookie: ReturnType<typeof vi.fn>) {
	expect(deleteCookie).toHaveBeenCalledTimes(2);
	expect(deleteCookie).toHaveBeenCalledWith(accessCookieName, {
		path: '/',
		domain: 'localhost'
	});
	expect(deleteCookie).toHaveBeenCalledWith(refreshCookieName, {
		path: '/',
		domain: 'localhost'
	});
}

describe('authentication hook', () => {
	it('renders login and clears cookies when refresh is rejected', async () => {
		expect.hasAssertions();

		vi.mocked(fetchBackend).mockReset();

		const now = Math.floor(Date.now() / 1000);
		const { cookies, deleteCookie } = createCookieJar({
			[accessCookieName]: createToken(now - 60),
			[refreshCookieName]: createToken(now + 3600)
		});
		const { input, resolve } = createHandleInput('/login?redirect-to=/login', cookies);
		vi.mocked(fetchBackend).mockResolvedValue({
			success: false,
			error: { title: 'Invalid session', status: 500, detail: 'Session no longer exists' }
		});

		const response = await authHandle(input);

		expect(response.status).toBe(200);
		expect(resolve).toHaveBeenCalledTimes(1);

		expectAuthCookiesCleared(deleteCookie);
	});

	it('redirects a protected route once when refresh is rejected', async () => {
		expect.hasAssertions();

		vi.mocked(fetchBackend).mockReset();

		const now = Math.floor(Date.now() / 1000);
		const { cookies, deleteCookie } = createCookieJar({
			[accessCookieName]: createToken(now - 60),
			[refreshCookieName]: createToken(now + 3600)
		});
		const { input, resolve } = createHandleInput('/profile', cookies);
		vi.mocked(fetchBackend).mockResolvedValue({
			success: false,
			error: { title: 'Invalid session', status: 500, detail: 'Session no longer exists' }
		});

		await expect(authHandle(input)).rejects.toMatchObject({
			status: 302,
			location: '/login?redirect-to=%2Fprofile'
		});
		expect(resolve).not.toHaveBeenCalled();

		expectAuthCookiesCleared(deleteCookie);
	});

	it('does not refresh when both tokens are expired', async () => {
		expect.hasAssertions();

		vi.mocked(fetchBackend).mockReset();

		const expiredAt = Math.floor(Date.now() / 1000) - 60;
		const { cookies, deleteCookie } = createCookieJar({
			[accessCookieName]: createToken(expiredAt),
			[refreshCookieName]: createToken(expiredAt)
		});
		const { input, resolve } = createHandleInput('/login', cookies);

		const response = await authHandle(input);

		expect(response.status).toBe(200);
		expect(fetchBackend).not.toHaveBeenCalled();
		expect(resolve).toHaveBeenCalledTimes(1);

		expectAuthCookiesCleared(deleteCookie);
	});

	it('sets authentication locals after a successful refresh', async () => {
		expect.hasAssertions();

		vi.mocked(fetchBackend).mockReset();

		const now = Math.floor(Date.now() / 1000);
		const refreshedAccessToken = createToken(now + 900);
		const refreshedRefreshToken = createToken(now + 3600);
		const { cookies, deleteCookie } = createCookieJar({
			[accessCookieName]: createToken(now - 60),
			[refreshCookieName]: createToken(now + 60)
		});
		const { event, input, resolve } = createHandleInput('/profile', cookies);
		vi.mocked(fetchBackend).mockResolvedValue({
			success: true,
			data: {},
			headers: {
				'Set-Cookie':
					`accessToken=${refreshedAccessToken}; Path=/; Domain=localhost; Max-Age=900; HttpOnly; Secure; SameSite=Lax,` +
					`refreshToken=${refreshedRefreshToken}; Path=/; Domain=localhost; Max-Age=3600; HttpOnly; Secure; SameSite=Lax`
			}
		});

		const response = await authHandle(input);

		expect(response.status).toBe(200);
		expect(resolve).toHaveBeenCalledTimes(1);
		expect(event.locals.jwtToken).toBe(refreshedAccessToken);
		expect(event.locals.jwtPayload).toMatchObject(user);
		expect(deleteCookie).not.toHaveBeenCalled();
	});

	it('clears authentication when refresh response has no access cookie', async () => {
		expect.hasAssertions();

		vi.mocked(fetchBackend).mockReset();

		const now = Math.floor(Date.now() / 1000);
		const refreshedRefreshToken = createToken(now + 3600);
		const { cookies, deleteCookie } = createCookieJar({
			[accessCookieName]: createToken(now - 60),
			[refreshCookieName]: createToken(now + 60)
		});
		const { event, input } = createHandleInput('/login', cookies);
		vi.mocked(fetchBackend).mockResolvedValue({
			success: true,
			data: {},
			headers: {
				'Set-Cookie': `refreshToken=${refreshedRefreshToken}; Path=/; Domain=localhost; Max-Age=3600; HttpOnly; Secure; SameSite=Lax`
			}
		});

		const response = await authHandle(input);

		expect(response.status).toBe(200);
		expect(event.locals.jwtToken).toBeUndefined();
		expect(event.locals.jwtPayload).toBeUndefined();

		expectAuthCookiesCleared(deleteCookie);
	});
});
