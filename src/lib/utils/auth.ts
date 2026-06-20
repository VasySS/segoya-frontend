import type { RequestEvent } from '@sveltejs/kit';
import type { JwtPayload } from '$lib/types/auth';
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

// sveltekit does not set cookies sent from another domain automatically
// https://github.com/sveltejs/kit/discussions/8564
export function setAllCookiesFromHeader(event: RequestEvent, cookieString: string) {
	const cookies = cookieString.split(',').map((cookie) => setCookie.parse(cookie));

	for (const [c] of cookies) {
		if (!c?.path) continue;

		event.cookies.set(c.name.trim(), c.value.trim(), {
			domain: c.domain,
			expires: c.expires,
			httpOnly: c.httpOnly,
			maxAge: c.maxAge,
			path: c.path,
			sameSite: c.sameSite as 'strict' | 'lax' | 'none',
			secure: c.secure
		});
	}
}
