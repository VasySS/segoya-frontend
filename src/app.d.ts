// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import type { JwtPayload } from '$lib/types/auth';
import type {
	ICreatePanoFromPositionOpts,
	ICreatePanoFromPositionOutput,
	PanoramaMeta
} from '$lib/types/seznam';

declare global {
	// Google maps
	let google: typeof import('google.maps');
	// Yandex maps
	let ymaps: typeof import('yandex-maps');
	// Seznam maps
	namespace Panorama {
		function panoramaFromPosition(
			opts: ICreatePanoFromPositionOpts
		): Promise<ICreatePanoFromPositionOutput>;

		function panoramaExists({
			lon: number,
			lat: number,
			apiKey: string
		}): Promise<{ exists: boolean; info: PanoramaMeta }>;
	}
	// turnstile captcha
	let turnstile: typeof import('@types/cloudflare-turnstile');
	// version from package.json
	let __VER__: string;

	namespace App {
		// interface Error {}
		interface Locals {
			jwtPayload: JwtPayload | undefined;
			jwtToken: string | undefined;
		}
		// interface PageData {}
		// interface Platform {}
	}
}

// eslint-disable-next-line unicorn/require-module-specifiers
export {};
