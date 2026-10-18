import { afterEach, describe, expect, it, vi } from 'vitest';

import { captchaAdapters } from './providers.js';
import type { CaptchaOptions, SmartCaptcha } from './types.js';

function options(): CaptchaOptions {
	return {
		siteKey: 'public-key',
		locale: 'ru',
		onToken: vi.fn<(token: string) => void>(),
		onError: vi.fn<() => void>()
	};
}

function turnstileSdk() {
	return {
		render: vi.fn<Turnstile.Turnstile['render']>().mockReturnValue('widget'),
		reset: vi.fn<Turnstile.Turnstile['reset']>(),
		remove: vi.fn<Turnstile.Turnstile['remove']>()
	};
}

function yandexSdk() {
	return {
		render: vi.fn<SmartCaptcha['render']>().mockReturnValue(0),
		reset: vi.fn<SmartCaptcha['reset']>(),
		destroy: vi.fn<SmartCaptcha['destroy']>(),
		subscribe: vi.fn<SmartCaptcha['subscribe']>().mockImplementation(() => vi.fn<() => void>())
	};
}

describe('captcha provider adapters', () => {
	// eslint-disable-next-line vitest/no-hooks
	afterEach(() => vi.unstubAllGlobals());

	it('renders a flexible localized Turnstile widget and delivers its token', () => {
		expect.hasAssertions();

		const sdk = turnstileSdk();
		vi.stubGlobal('turnstile', sdk);
		const handlers = options();
		const container = document.createElement('div');
		captchaAdapters.turnstile.render(container, handlers);
		const params = sdk.render.mock.calls[0]?.[1];
		params?.callback?.('cloudflare-token');

		expect(sdk.render).toHaveBeenCalledWith(
			container,
			expect.objectContaining({
				sitekey: 'public-key',
				size: 'flexible',
				language: 'ru'
			})
		);
		expect(handlers.onToken).toHaveBeenCalledWith('cloudflare-token');
	});

	it.each(['expired-callback', 'timeout-callback'] as const)(
		'clears Turnstile tokens on %s',
		(event) => {
			expect.hasAssertions();

			const sdk = turnstileSdk();
			vi.stubGlobal('turnstile', sdk);
			const handlers = options();
			captchaAdapters.turnstile.render(document.createElement('div'), handlers);
			const params = sdk.render.mock.calls[0]?.[1];
			params?.[event]?.('expired-token');

			expect(handlers.onToken).toHaveBeenCalledWith('');
		}
	);

	it('reports Turnstile errors and resets/removes only its own widget', () => {
		expect.hasAssertions();

		const sdk = turnstileSdk();
		vi.stubGlobal('turnstile', sdk);
		const handlers = options();
		const { reset, destroy } = captchaAdapters.turnstile.render(
			document.createElement('div'),
			handlers
		);
		sdk.render.mock.calls[0]?.[1]?.['error-callback']?.('network');
		reset();
		destroy();

		expect(handlers.onError).toHaveBeenCalledExactlyOnceWith();
		expect(sdk.reset).toHaveBeenCalledExactlyOnceWith('widget');
		expect(sdk.remove).toHaveBeenCalledExactlyOnceWith('widget');
	});

	it('rejects an unsuccessful Turnstile render', () => {
		expect.hasAssertions();

		const sdk = turnstileSdk();
		sdk.render.mockReturnValueOnce(undefined);
		vi.stubGlobal('turnstile', sdk);

		expect(() =>
			captchaAdapters.turnstile.render(document.createElement('div'), options())
		).toThrow('failed to render');
	});

	it('renders a localized visible Yandex widget and delivers its token', () => {
		expect.hasAssertions();

		const sdk = yandexSdk();
		vi.stubGlobal('smartCaptcha', sdk);
		const handlers = options();
		const container = document.createElement('div');
		captchaAdapters.yandex.render(container, handlers);
		sdk.render.mock.calls[0]?.[1].callback('yandex-token');

		expect(sdk.render).toHaveBeenCalledWith(container, {
			sitekey: 'public-key',
			hl: 'ru',
			callback: handlers.onToken
		});
		expect(handlers.onToken).toHaveBeenCalledWith('yandex-token');
	});

	it.each([
		{ event: 'token-expired', tokens: [['']], errors: [] },
		{ event: 'network-error', tokens: [], errors: [[]] },
		{ event: 'javascript-error', tokens: [], errors: [[]] }
	] as const)('handles the Yandex $event event', ({ event, tokens, errors }) => {
		expect.hasAssertions();

		const sdk = yandexSdk();
		vi.stubGlobal('smartCaptcha', sdk);
		const handlers = options();
		captchaAdapters.yandex.render(document.createElement('div'), handlers);
		sdk.subscribe.mock.calls.find((call) => call[1] === event)?.[2]();

		expect(vi.mocked(handlers.onToken).mock.calls).toStrictEqual(tokens);
		expect(vi.mocked(handlers.onError).mock.calls).toStrictEqual(errors);
	});

	it('resets Yandex widget zero and unsubscribes every listener on destruction', () => {
		expect.hasAssertions();

		const sdk = yandexSdk();
		vi.stubGlobal('smartCaptcha', sdk);
		const { reset, destroy } = captchaAdapters.yandex.render(
			document.createElement('div'),
			options()
		);
		reset();
		destroy();

		expect(sdk.reset).toHaveBeenCalledExactlyOnceWith(0);
		expect(sdk.destroy).toHaveBeenCalledExactlyOnceWith(0);

		for (const result of sdk.subscribe.mock.results) {
			expect(result.value).toHaveBeenCalledExactlyOnceWith();
		}
	});
});
