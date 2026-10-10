/* eslint-disable unicorn/prefer-global-this -- Cap configuration lives on the browser window. */
import { afterEach, describe, expect, it, vi } from 'vitest';

import { capAdapter } from './cap.js';
import type { CaptchaOptions } from './types.js';

const sdk = vi.hoisted(() => ({ initialize: vi.fn<() => void>() }));
vi.mock(import('cap-widget'), () => {
	sdk.initialize();
	return {};
});

class MockCapWidget extends HTMLElement {
	reset = vi.fn<() => void>(() => {
		this.dispatchEvent(new CustomEvent('reset'));
	});
}

function renderWidget(locale: 'ru' | 'en' = 'ru') {
	if (!customElements.get('cap-widget')) customElements.define('cap-widget', MockCapWidget);
	const host = document.createElement('div');
	document.body.append(host);
	const handlers: CaptchaOptions = {
		siteKey: 'public-key',
		locale,
		onToken: vi.fn<(token: string) => void>(),
		onError: vi.fn<() => void>()
	};
	const view = capAdapter.render(host, handlers);
	const widget = host.querySelector<MockCapWidget>('cap-widget');
	if (!widget) throw new Error('Mock Cap widget was not rendered');
	return { host, widget, handlers, view };
}

describe('self-hosted Cap adapter', () => {
	// eslint-disable-next-line vitest/no-hooks
	afterEach(() => {
		vi.restoreAllMocks();
		document.body.replaceChildren();
	});

	it('imports the bundled SDK once and points runtime assets at the self-hosted instance', async () => {
		expect.hasAssertions();

		const registry = vi.spyOn(customElements, 'get').mockReturnValue(MockCapWidget);
		const first = capAdapter.load();
		const second = capAdapter.load();

		expect(first).toBe(second);
		expect(window.CAP_CUSTOM_WASM_URL).toBe('https://captcha.example.com/assets/cap_wasm_bg.wasm');
		expect(window.CAP_CUSTOM_HASHWX_URL).toBe('https://captcha.example.com/assets/hashwx.wasm');
		expect(window.CAP_PAKO_URL).toBe('https://captcha.example.com/assets/pako_inflate.min.js');

		await first;
		await capAdapter.load();

		expect(sdk.initialize).toHaveBeenCalledExactlyOnceWith();
		expect(document.head.querySelectorAll('script')).toHaveLength(0);

		registry.mockRestore();
	});

	it.each(['ru', 'en'] as const)(
		'renders a visible %s widget for the configured instance and site key',
		(locale) => {
			expect.hasAssertions();

			const { widget, view } = renderWidget(locale);

			expect(widget).toHaveAttribute(
				'data-cap-api-endpoint',
				'https://captcha.example.com/public-key/'
			);
			expect(widget).toHaveAttribute('data-cap-lang', locale);
			expect(widget).toHaveAttribute('data-cap-hidden-field-name', 'captcha');
			expect(widget.style.getPropertyValue('--cap-widget-width')).toBe('100%');

			view.destroy();
		}
	);

	it('retries SDK initialization when the custom element was unavailable', async () => {
		expect.hasAssertions();

		vi.resetModules();
		const { capAdapter: freshAdapter } = await import('./cap.js');
		const registry = vi.spyOn(customElements, 'get').mockReturnValue(undefined);

		await expect(freshAdapter.load()).rejects.toThrow('Cap SDK is unavailable');

		registry.mockReturnValue(MockCapWidget);

		await expect(freshAdapter.load()).resolves.toBeUndefined();
	});

	it('delivers tokens and clears them on SDK reset, including expiry', () => {
		expect.hasAssertions();

		const { widget, handlers, view } = renderWidget();
		widget.dispatchEvent(new CustomEvent('solve', { detail: { token: 'cap-token' } }));
		widget.dispatchEvent(new CustomEvent('reset'));

		expect(vi.mocked(handlers.onToken).mock.calls).toStrictEqual([['cap-token'], ['']]);

		view.destroy();
	});

	it('reports SDK errors and resets the widget for a new submission', () => {
		expect.hasAssertions();

		const { widget, handlers, view } = renderWidget();
		widget.dispatchEvent(new CustomEvent('error', { detail: { message: 'Failed to redeem' } }));
		view.reset();

		expect(handlers.onError).toHaveBeenCalledExactlyOnceWith();
		expect(widget.reset).toHaveBeenCalledExactlyOnceWith();
		expect(handlers.onToken).toHaveBeenCalledExactlyOnceWith('');

		view.destroy();
	});

	it('keeps custom reset and error events from reaching native form handlers', () => {
		expect.hasAssertions();

		const { widget, host, view, handlers } = renderWidget();
		const resetForm = vi.fn<() => void>();
		const globalError = vi.fn<(event: Event) => void>();
		host.addEventListener(
			'reset',
			(event) => {
				if (!event.defaultPrevented) resetForm();
			},
			{ capture: true }
		);
		host.addEventListener('error', globalError);
		// Match the SDK's named dispatchEvent API rather than native DOM dispatch.
		Reflect.apply(widget.dispatchEvent.bind(widget), widget, ['reset']);
		Reflect.apply(widget.dispatchEvent.bind(widget), widget, ['error']);

		expect(handlers.onToken).toHaveBeenCalledExactlyOnceWith('');
		expect(handlers.onError).toHaveBeenCalledExactlyOnceWith();
		expect(resetForm).not.toHaveBeenCalled();
		expect(globalError).not.toHaveBeenCalled();

		view.destroy();
	});

	it('removes its widget and listeners so detached events cannot change form state', () => {
		expect.hasAssertions();

		const { widget, handlers, view, host } = renderWidget();
		view.destroy();
		widget.dispatchEvent(new CustomEvent('solve', { detail: { token: 'stale-token' } }));
		widget.dispatchEvent(new CustomEvent('reset'));
		widget.dispatchEvent(new CustomEvent('error'));

		expect(host.querySelector('cap-widget')).toBeNull();
		expect(handlers.onToken).not.toHaveBeenCalled();
		expect(handlers.onError).not.toHaveBeenCalled();
	});
});
