/* eslint-disable unicorn/prefer-global-this -- SDKs are optional properties of the browser window. */
import { loadCaptchaScript } from './script.js';
import type { CaptchaAdapter, CaptchaProvider } from './types.js';

export const captchaAdapters: Record<CaptchaProvider, CaptchaAdapter> = {
	turnstile: {
		height: 80,
		load: () =>
			loadCaptchaScript(
				'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=segoyaTurnstileOnLoad',
				'segoyaTurnstileOnLoad',
				() => Boolean(window.turnstile)
			),
		render: (container, { siteKey, locale, onToken, onError }) => {
			const sdk = window.turnstile;
			if (!sdk) throw new Error('Turnstile SDK is unavailable');
			const widgetId = sdk.render(container, {
				sitekey: siteKey,
				size: 'flexible',
				language: locale,
				callback: onToken,
				'expired-callback': () => {
					onToken('');
				},
				'timeout-callback': () => {
					onToken('');
				},
				'error-callback': () => {
					onError();
					return true;
				},
				'unsupported-callback': onError
			});
			if (!widgetId) throw new Error('Turnstile widget failed to render');
			return {
				reset: () => {
					sdk.reset(widgetId);
				},
				destroy: () => {
					sdk.remove(widgetId);
				}
			};
		}
	},
	yandex: {
		height: 100,
		load: () =>
			loadCaptchaScript(
				'https://smartcaptcha.cloud.yandex.ru/captcha.js?render=onload&onload=segoyaSmartCaptchaOnLoad',
				'segoyaSmartCaptchaOnLoad',
				() => Boolean(window.smartCaptcha)
			),
		render: (container, { siteKey, locale, onToken, onError }) => {
			const sdk = window.smartCaptcha;
			if (!sdk) throw new Error('Yandex CAPTCHA SDK is unavailable');
			const widgetId = sdk.render(container, {
				sitekey: siteKey,
				hl: locale,
				callback: onToken
			});
			const unsubscribe = [
				sdk.subscribe(widgetId, 'token-expired', () => {
					onToken('');
				}),
				sdk.subscribe(widgetId, 'network-error', onError),
				sdk.subscribe(widgetId, 'javascript-error', onError)
			];
			return {
				reset: () => {
					sdk.reset(widgetId);
				},
				destroy: () => {
					for (const stop of unsubscribe) stop();
					sdk.destroy(widgetId);
				}
			};
		}
	}
};
