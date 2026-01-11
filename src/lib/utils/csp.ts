import {
	AVATARS_BASE_URL,
	BACKEND_BASE_URL,
	BACKEND_BASE_WS_URL,
	STATIC_BASE_URL
} from '../api/base';

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
		// oauth
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
		// for api checking from profile page
		'https://geocode-maps.yandex.ru'
	],
	'img-src': [
		"'self'",
		AVATARS_BASE_URL,
		STATIC_BASE_URL,
		// for minimap tiles
		'https://*.tile.openstreetmap.org',
		'https://*.basemaps.cartocdn.com',
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
		// for cloudflare captcha
		'https://challenges.cloudflare.com',
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
	'worker-src': ["'self'"]
} as const;

export const csp = Object.entries(directives)
	.map(([key, arr]) => key + ' ' + arr.join(' '))
	.join('; ');
