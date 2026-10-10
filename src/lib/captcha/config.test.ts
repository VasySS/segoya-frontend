import { describe, expect, it } from 'vitest';

import { variables } from '../../env.js';

describe('captcha provider configuration', () => {
	it.each([undefined, ''])('defaults to Cap for provider %s', async (value) => {
		expect.hasAssertions();

		const result = await variables.VITE_CAPTCHA_PROVIDER.schema['~standard'].validate(value);

		expect(result).toStrictEqual({ value: 'cap' });
	});

	it.each(['turnstile', 'yandex', 'cap'])('accepts an explicit %s provider', async (provider) => {
		expect.hasAssertions();

		const result = await variables.VITE_CAPTCHA_PROVIDER.schema['~standard'].validate(provider);

		expect(result).toStrictEqual({ value: provider });
	});

	it('rejects unknown providers instead of silently switching', async () => {
		expect.hasAssertions();

		const result = await variables.VITE_CAPTCHA_PROVIDER.schema['~standard'].validate('unknown');

		expect(result).toStrictEqual({
			issues: [{ message: 'VITE_CAPTCHA_PROVIDER must be turnstile, yandex, or cap' }]
		});
	});

	it.each([
		{ input: undefined, expected: '' },
		{ input: '', expected: '' },
		{ input: 'https://captcha.example.com', expected: 'https://captcha.example.com/' },
		{ input: 'https://example.com/cap/', expected: 'https://example.com/cap/' },
		{ input: 'http://localhost:3000/cap', expected: 'http://localhost:3000/cap/' }
	])('normalizes the Cap instance URL $input', async ({ input, expected }) => {
		expect.hasAssertions();

		const result = await variables.VITE_CAPTCHA_VERIFY_URL.schema['~standard'].validate(input);

		expect(result).toStrictEqual({ value: expected });
	});

	it.each([
		'invalid',
		'/cap/',
		'ftp://example.com',
		'https://user:secret@example.com',
		'https://example.com?key=secret',
		'https://example.com#fragment'
	])('rejects unsafe Cap instance URL %s', async (input) => {
		expect.hasAssertions();

		const result = await variables.VITE_CAPTCHA_VERIFY_URL.schema['~standard'].validate(input);

		expect(result).toHaveProperty('issues');
	});
});
