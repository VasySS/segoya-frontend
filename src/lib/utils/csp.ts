import {
	VITE_CAPTCHA_PROVIDER,
	VITE_CAPTCHA_SITE_KEY,
	VITE_CAPTCHA_VERIFY_URL
} from '$app/env/public';

import {
	AVATARS_BASE_URL,
	BACKEND_BASE_URL,
	BACKEND_BASE_WS_URL,
	STATIC_BASE_URL
} from '../api/base';

const isCapEnabled = VITE_CAPTCHA_PROVIDER === 'cap' && VITE_CAPTCHA_SITE_KEY.length > 0;
const capOrigins =
	isCapEnabled && VITE_CAPTCHA_VERIFY_URL ? [new URL(VITE_CAPTCHA_VERIFY_URL).origin] : [];

// https://yandex.ru/dev/jsapi-v2-1/doc/ru/v2-1/dg/concepts/load#using-csp

export const directives = {
	'base-uri': ["'self'"],
	'child-src': [
		"'self'",
		// for yandex panoramas
		'https://api-maps.yandex.ru',
		'https://enterprise.api-maps.yandex.ru'
	],
	'connect-src': [
		"'self'",
		BACKEND_BASE_URL,
		BACKEND_BASE_WS_URL,
		...capOrigins,
		// CAPTCHA SDK and verification requests
		'https://challenges.cloudflare.com',
		'https://smartcaptcha.cloud.yandex.ru',
		'https://smartcaptcha.yandexcloud.net',
		// OAuth
		'https://oauth.yandex.ru',
		// for yandex panoramas
		'https://api-maps.yandex.ru',
		'https://enterprise.api-maps.yandex.ru',
		'https://suggest-maps.yandex.ru',
		'https://*.maps.yandex.net',
		'https://yandex.ru',
		'https://*.taxi.yandex.net',
		// for seznam panoramas
		'https://api.mapy.cz',
		// for google panoramas
		'https://maps.googleapis.com',
		// for API checking from profile page
		'https://geocode-maps.yandex.ru'
	],
	'img-src': [
		"'self'",
		AVATARS_BASE_URL,
		STATIC_BASE_URL,
		// for minimap tiles
		'https://*.tile.openstreetmap.org',
		'https://server.arcgisonline.com',
		// for yandex panoramas
		'data: https://*.maps.yandex.net',
		'data: api-maps.yandex.ru',
		'https://*.maps.yandex.net',
		'api-maps.yandex.ru',
		'enterprise.api-maps.yandex.ru',
		'https://yandex.ru',
		// for seznam panoramas
		'https://api.mapy.cz',
		// for google panoramas
		'https://maps.gstatic.com',
		'https://*.googleapis.com'
	],
	'font-src': [
		"'self'",
		'data:',
		// google fonts
		'https://fonts.gstatic.com'
	],
	'form-action': ["'self'"],
	'frame-ancestors': ["'self'"],
	'frame-src': [
		"'self'",
		// for cloudflare captcha
		'https://challenges.cloudflare.com',
		// for yandex captcha
		'https://smartcaptcha.cloud.yandex.ru',
		'https://smartcaptcha.yandexcloud.net',
		// for yandex panoramas
		'https://api-maps.yandex.ru',
		'https://enterprise.api-maps.yandex.ru'
	],
	'manifest-src': ["'self'"],
	'media-src': ["'self'", 'data:'],
	'object-src': ["'none'"],
	'style-src': [
		"'self'",
		"'unsafe-inline'", // 'unsafe-inline' is required for styles due to Svelte's use of inline styles
		// google fonts
		'https://fonts.googleapis.com',
		// for yandex panoramas
		'blob:'
	],
	'default-src': ["'self'", BACKEND_BASE_URL, BACKEND_BASE_WS_URL],
	'script-src': [
		"'self'",
		"'unsafe-inline'",
		// Optional Cap decompression fallback is served by the configured instance.
		...capOrigins,
		// Cap's server-generated instrumentation uses eval() and Function(), in addition to WASM.
		...(isCapEnabled ? ["'wasm-unsafe-eval'", "'unsafe-eval'"] : []),
		// for cloudflare captcha
		'https://challenges.cloudflare.com',
		// for yandex captcha
		'https://smartcaptcha.cloud.yandex.ru',
		'https://smartcaptcha.yandexcloud.net',
		// for yandex panoramas
		'https://api-maps.yandex.ru',
		'https://enterprise.api-maps.yandex.ru',
		'https://suggest-maps.yandex.ru',
		'https://*.maps.yandex.net',
		'https://yandex.ru',
		'https://yastatic.net',
		// for seznam panoramas
		'https://api.mapy.cz',
		// for google panoramas
		'https://maps.googleapis.com'
	],
	'worker-src': ["'self'", ...(isCapEnabled ? ['blob:'] : [])]
} as const;

export const csp = Object.entries(directives)
	.map(([key, arr]) => key + ' ' + arr.join(' '))
	.join('; ');
