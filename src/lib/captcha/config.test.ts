import { describe, expect, it } from 'vitest';

import { variables } from '../../env.js';

describe('captcha provider configuration', () => {
	it.each([undefined, '', 'turnstile'])('keeps Turnstile for provider %s', async (value) => {
		expect.hasAssertions();

		const result = await variables.VITE_CAPTCHA_PROVIDER.schema['~standard'].validate(value);

		expect(result).toStrictEqual({ value: 'turnstile' });
	});

	it('accepts an explicit Yandex provider', async () => {
		expect.hasAssertions();

		const result = await variables.VITE_CAPTCHA_PROVIDER.schema['~standard'].validate('yandex');

		expect(result).toStrictEqual({ value: 'yandex' });
	});

	it('rejects unknown providers instead of silently switching', async () => {
		expect.hasAssertions();

		const result = await variables.VITE_CAPTCHA_PROVIDER.schema['~standard'].validate('unknown');

		expect(result).toStrictEqual({
			issues: [{ message: 'VITE_CAPTCHA_PROVIDER must be turnstile or yandex' }]
		});
	});
});
