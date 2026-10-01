import type { Cookies, RequestEvent } from '@sveltejs/kit';
import { accessCookieName, refreshCookieName } from '#lib/api/auth.js';
import { FRONTEND_DOMAIN } from '#lib/api/base.js';
import type { JwtPayload } from '#lib/types/auth.js';
import setCookie from 'set-cookie-parser';

export const isTokenExpired = (jwt: string) => {
	const payload = getTokenPayload(jwt);
	if (!payload) return true;

	const expiresAt = Temporal.Instant.fromEpochMilliseconds(payload.exp * 1000);
	return Temporal.Instant.compare(expiresAt, Temporal.Now.instant()) < 0;
};

export const getTokenPayload = (jwt: string) => {
	const jwtPayload = jwt.split('.', 2)[1];
	if (!jwtPayload) return;

	// eslint-disable-next-line unicorn/prefer-uint8array-base64
	return JSON.parse(atob(jwtPayload)) as JwtPayload;
};

export function getCookiesFromString(cookieString: string): Record<string, string> {
	const cookies = Object.fromEntries(
		cookieString.split('; ').map((cookie) => cookie.split('='))
	) as Record<string, string>;

	return cookies;
}

export function clearAuthCookies(cookies: Cookies) {
	const options = {
		path: '/',
		domain: import.meta.env.DEV ? 'localhost' : FRONTEND_DOMAIN
	};

	cookies.delete(accessCookieName, options);
	cookies.delete(refreshCookieName, options);
}

// sveltekit does not set cookies sent from another domain automatically
// https://github.com/sveltejs/kit/discussions/8564
export function setAllCookiesFromHeader(event: RequestEvent, cookieString: string) {
	const cookies = cookieString.split(',').map((cookie) => setCookie.parse(cookie));
	const values: Record<string, string> = {};

	for (const [c] of cookies) {
		if (!c?.path) continue;

		const name = c.name.trim();
		const value = c.value.trim();

		const options = {
			path: c.path,
			...(c.domain && { domain: c.domain }),
			...(c.expires && { expires: c.expires }),
			...(typeof c.httpOnly === 'boolean' && { httpOnly: c.httpOnly }),
			...(typeof c.maxAge === 'number' && { maxAge: c.maxAge }),
			...(c.sameSite && { sameSite: c.sameSite as 'strict' | 'lax' | 'none' }),
			...(typeof c.secure === 'boolean' && { secure: c.secure })
		} satisfies Parameters<RequestEvent['cookies']['set']>[2];

		event.cookies.set(name, value, options);
		values[name] = value;
	}

	return values;
}
