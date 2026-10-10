// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import type { SmartCaptcha } from '#lib/captcha/types.js';
import type { JwtPayload } from '#lib/types/auth.js';
import type {
	ICreatePanoFromPositionOpts,
	ICreatePanoFromPositionOutput,
	PanoramaMeta
} from '#lib/types/seznam.js';

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
	interface Window {
		turnstile?: Turnstile.Turnstile;
		smartCaptcha?: SmartCaptcha;
		segoyaTurnstileOnLoad?: () => void;
		segoyaSmartCaptchaOnLoad?: () => void;
	}
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

export {};
