import { VITE_CAPTCHA_PROVIDER, VITE_CAPTCHA_SITE_KEY } from '$app/env/public';

import type { CaptchaProvider } from './types.js';

const provider: CaptchaProvider = VITE_CAPTCHA_PROVIDER;

export const captchaConfig = {
	provider,
	siteKey: VITE_CAPTCHA_SITE_KEY
};

export const isCaptchaEnabled = captchaConfig.siteKey.length > 0;
