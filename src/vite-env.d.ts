/// <reference types="vite/client" />

// https://vite.dev/guide/env-and-mode#intellisense-for-typescript

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ViteTypeOptions {
	// By adding this line, you can make the type of ImportMetaEnv strict
	// to disallow unknown keys.
	// strictImportMetaEnv: unknown
}

interface ImportMetaEnv {
	readonly VITE_FRONTEND_DOMAIN: string;

	readonly VITE_BACKEND_BASE_URL: string;
	readonly VITE_BACKEND_BASE_WS_URL: string;

	readonly VITE_YANDEX_PANO_API_KEY: string;
	readonly VITE_GOOGLE_PANO_API_KEY: string;
	readonly VITE_SEZNAM_PANO_API_KEY: string;

	readonly VITE_AVATARS_BASE_URL: string;
	readonly VITE_STATIC_BASE_URL: string;
	readonly VITE_TURNSTILE_SITE_KEY: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
