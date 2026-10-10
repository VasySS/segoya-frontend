import { defineEnvVars } from '@sveltejs/kit/env';

const publicStaticString = {
	public: true,
	static: true,
	schema: (value = '') => value
};

export const variables = defineEnvVars({
	VITE_FRONTEND_DOMAIN: publicStaticString,
	VITE_BACKEND_BASE_URL: publicStaticString,
	VITE_BACKEND_BASE_WS_URL: publicStaticString,
	VITE_YANDEX_PANO_API_KEY: publicStaticString,
	VITE_GOOGLE_PANO_API_KEY: publicStaticString,
	VITE_SEZNAM_PANO_API_KEY: publicStaticString,
	VITE_AVATARS_BASE_URL: publicStaticString,
	VITE_STATIC_BASE_URL: publicStaticString,
	VITE_CAPTCHA_SITE_KEY: publicStaticString,
	VITE_CAPTCHA_VERIFY_URL: {
		public: true,
		static: true,
		schema: (value = '') => {
			if (value === '') return '';
			const url = new URL(value);
			if (
				!['https:', 'http:'].includes(url.protocol) ||
				url.username ||
				url.password ||
				url.search ||
				url.hash
			) {
				throw new Error(
					'VITE_CAPTCHA_VERIFY_URL must be an HTTP(S) instance URL without credentials, query, or fragment'
				);
			}
			url.pathname = url.pathname.replace(/\/$/, '') + '/';
			return url.href;
		}
	},
	VITE_CAPTCHA_PROVIDER: {
		public: true,
		static: true,
		schema: (value = 'cap') => {
			if (value === '') return 'cap';
			if (value !== 'turnstile' && value !== 'yandex' && value !== 'cap') {
				throw new Error('VITE_CAPTCHA_PROVIDER must be turnstile, yandex, or cap');
			}
			return value;
		}
	}
});
