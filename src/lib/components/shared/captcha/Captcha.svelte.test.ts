import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import type { CaptchaOptions, CaptchaProvider } from '#lib/captcha/types.js';
import { m } from '#paraglide/messages.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import Captcha from './Captcha.svelte';
import CaptchaHarness from './CaptchaHarness.svelte';

const mocks = vi.hoisted(
	(): {
		config: { provider: CaptchaProvider; siteKey: string };
		load: ReturnType<typeof vi.fn<() => Promise<void>>>;
		render: ReturnType<
			typeof vi.fn<
				(
					container: HTMLElement,
					options: CaptchaOptions
				) => { reset: () => void; destroy: () => void }
			>
		>;
		reset: ReturnType<typeof vi.fn<() => void>>;
		destroy: ReturnType<typeof vi.fn<() => void>>;
	} => ({
		config: { provider: 'turnstile', siteKey: 'key' },
		load: vi.fn<() => Promise<void>>(),
		render: vi.fn<
			(
				container: HTMLElement,
				options: CaptchaOptions
			) => {
				reset: () => void;
				destroy: () => void;
			}
		>(),
		reset: vi.fn<() => void>(),
		destroy: vi.fn<() => void>()
	})
);

vi.mock(import('#lib/captcha/config.js'), () => ({
	captchaConfig: mocks.config,
	get isCaptchaEnabled() {
		return mocks.config.siteKey.length > 0;
	}
}));
vi.mock(import('#lib/captcha/providers.js'), () => ({
	captchaAdapters: {
		turnstile: { height: 80, load: mocks.load, render: mocks.render },
		yandex: { height: 100, load: mocks.load, render: mocks.render }
	}
}));

async function mountedWidget() {
	await waitFor(() => {
		expect(mocks.render).toHaveBeenCalledTimes(1);
	});
	const options = mocks.render.mock.calls[0]?.[1];
	if (!options) throw new Error('Expected rendered CAPTCHA');
	return options;
}

describe('shared CAPTCHA component', () => {
	// eslint-disable-next-line vitest/no-hooks
	beforeEach(() => {
		vi.resetAllMocks();
		mocks.config.provider = 'turnstile';
		mocks.config.siteKey = 'key';
		mocks.load.mockResolvedValue(undefined);
		mocks.render.mockReturnValue({ reset: mocks.reset, destroy: mocks.destroy });
	});

	it.each(['turnstile', 'yandex'] as const)(
		'binds and clears %s tokens on expiry/error',
		async (provider) => {
			expect.hasAssertions();

			mocks.config.provider = provider;
			render(CaptchaHarness);
			const options = await mountedWidget();
			options.onToken('verified-token');
			await waitFor(() => {
				expect(screen.getByRole('status')).toHaveTextContent('verified-token');
			});
			options.onToken('');
			await waitFor(() => {
				expect(screen.getByRole('status')).toHaveTextContent(/^$/);
			});
			options.onToken('next-token');
			options.onError();
			await waitFor(() => {
				expect(screen.getByRole('alert')).toHaveTextContent(m.captchaLoadError());
			});

			expect(screen.getByRole('status')).toHaveTextContent(/^$/);
		}
	);

	it('clears the bound token before resetting for another submission', async () => {
		expect.hasAssertions();

		const user = userEvent.setup();
		render(CaptchaHarness);
		const options = await mountedWidget();
		options.onToken('consumed-token');
		await waitFor(() => {
			expect(screen.getByRole('status')).toHaveTextContent('consumed-token');
		});
		await user.click(screen.getByRole('button', { name: 'Reset CAPTCHA' }));

		expect(screen.getByRole('status')).toHaveTextContent(/^$/);
		expect(mocks.reset).toHaveBeenCalledExactlyOnceWith();
	});

	it('retries an SDK failure without leaving a stale widget', async () => {
		expect.hasAssertions();

		const user = userEvent.setup();
		mocks.load.mockRejectedValueOnce(new Error('SDK unavailable'));
		render(Captcha);
		await screen.findByRole('alert');
		await user.click(screen.getByRole('button', { name: m.captchaRetry() }));
		await mountedWidget();

		expect(mocks.load).toHaveBeenCalledTimes(2);
		expect(screen.queryByRole('alert')).not.toBeInTheDocument();
	});

	it('destroys a widget and ignores its callbacks after unmount', async () => {
		expect.hasAssertions();

		const { unmount } = render(Captcha);
		const options = await mountedWidget();
		unmount();
		options.onError();

		expect(mocks.destroy).toHaveBeenCalledExactlyOnceWith();
		expect(screen.queryByRole('alert')).not.toBeInTheDocument();
	});

	it('does not render a detached widget when navigation interrupts SDK loading', async () => {
		expect.hasAssertions();

		const { promise, resolve } = Promise.withResolvers<undefined>();
		mocks.load.mockReturnValueOnce(promise);
		const { unmount } = render(Captcha);
		unmount();
		resolve(undefined);
		await Promise.resolve();

		expect(mocks.render).not.toHaveBeenCalled();
	});

	it('supports unconfigured development without requesting either SDK', () => {
		expect.hasAssertions();

		mocks.config.siteKey = '';
		render(Captcha);

		expect(mocks.load).not.toHaveBeenCalled();
		expect(screen.queryByLabelText(m.captchaLabel())).not.toBeInTheDocument();
	});
});
