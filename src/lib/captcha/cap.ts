/* eslint-disable unicorn/prefer-global-this -- Cap exposes optional configuration on the browser window. */
/* eslint-disable unicorn/no-global-object-property-assignment -- These globals are the SDK's documented asset configuration. */
import { VITE_CAPTCHA_VERIFY_URL } from '$app/env/public';
import type { CapSolveEvent } from 'cap-widget';
import { untrack } from 'svelte';

import type { CaptchaAdapter } from './types.js';

const sdk = { promise: undefined as Promise<void> | undefined };

function capUrl(path: string) {
	if (!VITE_CAPTCHA_VERIFY_URL) throw new Error('VITE_CAPTCHA_VERIFY_URL is required for Cap');
	return new URL(path, VITE_CAPTCHA_VERIFY_URL).href;
}

export const capAdapter: CaptchaAdapter = {
	height: 80,
	load: () => {
		window.CAP_CUSTOM_WASM_URL = capUrl('assets/cap_wasm_bg.wasm');
		window.CAP_CUSTOM_HASHWX_URL = capUrl('assets/hashwx.wasm');
		// Older browsers may need this optional self-hosted decompression fallback.
		window.CAP_PAKO_URL = capUrl('assets/pako_inflate.min.js');
		// Import only in the browser: the SDK registers a custom element and accesses window.
		sdk.promise ??= import('cap-widget')
			.then(() => {
				if (!customElements.get('cap-widget')) throw new Error('Cap SDK is unavailable');
			})
			.catch((error: unknown) => {
				sdk.promise = undefined;
				throw error;
			});
		return sdk.promise;
	},
	render: (container, { siteKey, locale, onToken, onError }) => {
		if (!customElements.get('cap-widget')) throw new Error('Cap SDK is unavailable');
		const widget = document.createElement('cap-widget');
		// Cap 0.1.58 dispatches named events, including a bubbling custom reset.
		// Svelte's document capture listener treats reset as a native form event.
		widget.dispatchEvent = (event: Event | string, detail: unknown = {}) => {
			const isReset = event === 'reset';
			const sdkEvent =
				typeof event === 'string'
					? new CustomEvent(event, {
							bubbles: event !== 'reset' && event !== 'error',
							cancelable: isReset,
							composed: true,
							detail
						})
					: event;
			// Svelte's capture listener skips canceled resets, even on custom elements.
			if (isReset) sdkEvent.preventDefault();
			// SDK callbacks can run during Svelte form updates and navigation cleanup.
			return untrack(() => HTMLElement.prototype.dispatchEvent.call(widget, sdkEvent));
		};
		widget.dataset.capApiEndpoint = capUrl(`${encodeURIComponent(siteKey)}/`);
		widget.dataset.capHiddenFieldName = 'captcha';
		widget.dataset.capLang = locale;
		widget.lang = locale;
		widget.style.setProperty('--cap-widget-width', '100%');
		widget.style.setProperty('--cap-background', 'var(--background)');
		widget.style.setProperty('--cap-color', 'var(--foreground)');
		widget.style.setProperty('--cap-border-color', 'var(--border)');
		widget.style.display = 'block';

		const solved = (event: CapSolveEvent) => {
			onToken(event.detail.token);
		};
		const cleared = (event: Event) => {
			event.stopPropagation();
			onToken('');
		};
		const failed = (event: Event) => {
			event.stopPropagation();
			onError();
		};
		widget.addEventListener('solve', solved);
		widget.addEventListener('reset', cleared);
		widget.addEventListener('error', failed);
		container.append(widget);

		return {
			reset: () => {
				widget.reset();
			},
			destroy: () => {
				widget.removeEventListener('solve', solved);
				widget.removeEventListener('reset', cleared);
				widget.removeEventListener('error', failed);
				// The SDK's disconnectedCallback aborts solving and terminates its workers.
				widget.remove();
			}
		};
	}
};
