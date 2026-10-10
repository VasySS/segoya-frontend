import {
	VITE_CAPTCHA_PROVIDER,
	VITE_TURNSTILE_SITE_KEY,
	VITE_YANDEX_CAPTCHA_SITE_KEY
} from '$app/env/public';

import type { CaptchaProvider } from './types.js';

const siteKeys = {
	turnstile: VITE_TURNSTILE_SITE_KEY,
	yandex: VITE_YANDEX_CAPTCHA_SITE_KEY
};

const provider: CaptchaProvider = VITE_CAPTCHA_PROVIDER;

export const captchaConfig = {
	provider,
	siteKey: siteKeys[provider]
};

export const captchaEnabled = captchaConfig.siteKey.length > 0;
