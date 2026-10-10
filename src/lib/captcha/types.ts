/// <reference types="cloudflare-turnstile" />

export type CaptchaProvider = 'turnstile' | 'yandex';

export interface CaptchaOptions {
	siteKey: string;
	locale: 'ru' | 'en';
	onToken: (token: string) => void;
	onError: () => void;
}

export interface CaptchaWidget {
	reset: () => void;
	destroy: () => void;
}

export interface CaptchaAdapter {
	height: number;
	load: () => Promise<void>;
	render: (container: HTMLElement, options: CaptchaOptions) => CaptchaWidget;
}

export interface SmartCaptcha {
	render: (
		container: HTMLElement,
		options: { sitekey: string; hl: 'ru' | 'en'; callback: (token: string) => void }
	) => number;
	reset: (widgetId: number) => void;
	destroy: (widgetId: number) => void;
	subscribe: (
		widgetId: number,
		event: 'token-expired' | 'network-error' | 'javascript-error',
		callback: () => void
	) => () => void;
}
