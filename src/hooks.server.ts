import { redirect, type Handle, type HandleFetch } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { accessCookieName, refreshCookieName } from '$lib/api/auth.ts';
import { fetchBackend } from '$lib/api/base.ts';
import { unprotectedRoutes } from '$lib/constants/unprotectedRoutes.ts';
import { getTokenPayload, isTokenExpired, setAllCookiesFromHeader } from '$lib/utils/auth.ts';
import { csp } from '$lib/utils/csp.ts';
import { paraglideMiddleware } from '$paraglide/server.js';

const paraglideHandle: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request: localizedRequest, locale }) => {
		event.request = localizedRequest;

		return resolve(event, {
			transformPageChunk: ({ html }) => {
				return html.replace('%lang%', locale);
			}
		});
	});

const authHandle: Handle = async ({ event, resolve }) => {
	const accessToken = event.cookies.get(accessCookieName);
	const refreshToken = event.cookies.get(refreshCookieName);

	if (accessToken && !isTokenExpired(accessToken)) {
		event.locals.jwtPayload = getTokenPayload(accessToken);
		event.locals.jwtToken = accessToken;
	} else if (refreshToken && !isTokenExpired(refreshToken)) {
		const response = await fetchBackend('', 'post', '/v1/auth/tokens/refresh', {
			body: {
				refreshToken: refreshToken
			}
		});

		if (!response.success) {
			event.cookies.delete(accessCookieName, { path: '/' });
			event.cookies.delete(refreshCookieName, { path: '/' });

			redirect(302, `/login?redirect-to=${event.url.pathname}`);
		}

		setAllCookiesFromHeader(event, response.headers['Set-Cookie']);

		const accessTokenCookie = event.cookies.get(accessCookieName);
		if (!accessTokenCookie) {
			redirect(302, `/login?redirect-to=${event.url.pathname}`);
		}

		event.locals.jwtPayload = getTokenPayload(accessTokenCookie);
		event.locals.jwtToken = accessTokenCookie;
	}

	const isPathProtected = !unprotectedRoutes.includes(event.url.pathname);
	if (isPathProtected && !event.locals.jwtToken) {
		redirect(302, `/login?redirect-to=${event.url.pathname}`);
	}

	// sveltekit doesn't preload fonts by default
	// https://kit.svelte.dev/docs/performance#optimizing-assets
	return await resolve(event, {
		preload: ({ type }) => type === 'font' || type === 'js' || type === 'css'
	});
};

// https://github.com/rodneylab/sveltekit-content-security-policy/blob/main/src/hooks.server.js
const securityHeadersHandle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	response.headers.set('X-Frame-Options', 'SAMEORIGIN');
	// origin is required for api keys for yandex and seznam panoramas to work
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set(
		'Permissions-Policy',
		'accelerometer=(), \
		autoplay=(), camera=(), \
		document-domain=(), \
		encrypted-media=(), \
		fullscreen=(), \
		gyroscope=(), \
		interest-cohort=(), \
		magnetometer=(), \
		microphone=(), \
		midi=(), \
		payment=(), \
		picture-in-picture=(), \
		publickey-credentials-get=(), \
		sync-xhr=(), \
		usb=(), \
		vxr-spatial-tracking=(), \
		geolocation=()'
	);

	response.headers.set('X-Content-Type-Options', 'nosniff');

	// response.headers.set('Content-Security-Policy-Report-Only', csp);
	response.headers.set('Content-Security-Policy', csp);

	return response;
};

export const handle = sequence(securityHeadersHandle, paraglideHandle, authHandle);

export const handleFetch: HandleFetch = async ({ event, request, fetch }) => {
	const forwardedFor = event.request.headers.get('x-forwarded-for');
	if (forwardedFor) {
		request.headers.set('x-forwarded-for', forwardedFor);
	}

	const realIP = event.request.headers.get('x-real-ip');
	if (realIP) {
		request.headers.set('x-real-ip', realIP);
	}

	const userAgent = event.request.headers.get('user-agent');
	if (userAgent) {
		request.headers.set('user-agent', userAgent);
	}

	return fetch(request);
};
