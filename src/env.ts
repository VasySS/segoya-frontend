import { defineEnvVars } from '@sveltejs/kit/env';

const publicStaticString = {
	public: true,
	static: true,
	schema: (value: string | undefined) => value ?? ''
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
	VITE_TURNSTILE_SITE_KEY: publicStaticString
});
