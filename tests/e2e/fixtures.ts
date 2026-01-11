import { test as base, expect, type Page } from '@playwright/test';
import { m } from '$paraglide/messages.js';
import { setLocale } from '$paraglide/runtime.js';

import { LoginPage } from './pages';
import { TEST_USERS } from './testData';

interface AuthenticatedPageFixture {
	authenticatedPage: Page;
}

export async function setEnLocale(page: Page) {
	await setLocale('en');
	await page
		.context()
		.addCookies([{ name: 'PARAGLIDE_LOCAL', value: 'en', url: 'http://localhost:5173' }]);
}

export async function addAuthenticationToPage(
	page: Page,
	username: string,
	password: string
): Promise<Page> {
	await setEnLocale(page);

	const loginPage = new LoginPage(page);
	await loginPage.goto();
	await loginPage.login(username, password);

	await page.waitForURL('**/profile', { timeout: 15_000 });
	await expect(page.getByRole('button', { name: m.profileLogout() })).toBeVisible({
		timeout: 10_000
	});

	return page;
}

export const test = base.extend<AuthenticatedPageFixture>({
	page: async ({ page }, use) => {
		await setEnLocale(page);
		await use(page);
	},
	authenticatedPage: async ({ page }, use) => {
		await setEnLocale(page);

		const authenticatedPage = await addAuthenticationToPage(
			page,
			TEST_USERS.default.username,
			TEST_USERS.default.password
		);

		await use(authenticatedPage);
	}
});
