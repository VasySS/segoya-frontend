/* eslint-disable unicorn/prefer-global-this -- Callbacks are optional browser SDK properties. */
import { afterEach, describe, expect, it, vi } from 'vitest';

import { loadCaptchaScript } from './script.js';

function scriptsFor(src: string) {
	return [...document.head.querySelectorAll<HTMLScriptElement>(':scope > script')].filter(
		(element) => element.src === src
	);
}

function script(src: string) {
	const element = scriptsFor(src)[0];
	if (!element) throw new Error('Expected CAPTCHA script');
	element.dataset.captchaTest = 'true';
	return element;
}

describe('captcha SDK loading', () => {
	// eslint-disable-next-line vitest/no-hooks
	afterEach(() => {
		vi.useRealTimers();
		for (const element of document.head.querySelectorAll(':scope > script[data-captcha-test]')) {
			element.remove();
		}
	});

	it('shares an in-flight SDK load and reuses the ready SDK on navigation', async () => {
		expect.hasAssertions();

		let isReady = false;
		const src = 'https://example.com/shared-captcha.js';
		const first = loadCaptchaScript(src, 'segoyaSmartCaptchaOnLoad', () => isReady);
		const second = loadCaptchaScript(src, 'segoyaSmartCaptchaOnLoad', () => isReady);
		const element = script(src);

		expect(second).toBe(first);
		expect(scriptsFor(src)).toHaveLength(1);

		isReady = true;
		window.segoyaSmartCaptchaOnLoad?.();
		await first;
		await loadCaptchaScript(src, 'segoyaSmartCaptchaOnLoad', () => isReady);

		expect(scriptsFor(src)).toStrictEqual([element]);
	});

	it('waits for SDK initialization even after the script load event', async () => {
		expect.hasAssertions();

		let isReady = false;
		const src = 'https://example.com/deferred-captcha.js';
		const resolved = vi.fn<() => void>();
		const pending = loadCaptchaScript(src, 'segoyaSmartCaptchaOnLoad', () => isReady).then(
			resolved
		);
		script(src).dispatchEvent(new Event('load'));
		await Promise.resolve();

		expect(resolved).not.toHaveBeenCalled();

		isReady = true;
		window.segoyaSmartCaptchaOnLoad?.();
		await pending;

		expect(resolved).toHaveBeenCalledExactlyOnceWith(undefined);
	});

	it('removes failed scripts and allows a new load on retry', async () => {
		expect.hasAssertions();

		let isReady = false;
		const src = 'https://example.com/retry-captcha.js';
		const pending = loadCaptchaScript(src, 'segoyaTurnstileOnLoad', () => isReady);
		const rejection = pending.catch((error: unknown) => error);
		const firstScript = script(src);
		firstScript.dispatchEvent(new Event('error'));

		await expect(rejection).resolves.toMatchObject({ message: 'CAPTCHA SDK failed to load' });
		expect(firstScript.isConnected).toBe(false);

		const retry = loadCaptchaScript(src, 'segoyaTurnstileOnLoad', () => isReady);

		expect(script(src)).not.toBe(firstScript);

		isReady = true;
		window.segoyaTurnstileOnLoad?.();
		await retry;
	});

	it('times out an SDK that never becomes ready', async () => {
		expect.hasAssertions();

		vi.useFakeTimers();
		const src = 'https://example.com/stalled-captcha.js';
		const pending = loadCaptchaScript(src, 'segoyaSmartCaptchaOnLoad', () => false);
		const rejection = pending.catch((error: unknown) => error);
		const element = script(src);
		await vi.advanceTimersByTimeAsync(15_000);

		await expect(rejection).resolves.toMatchObject({ message: 'CAPTCHA SDK failed to load' });
		expect(element.isConnected).toBe(false);
	});
});
