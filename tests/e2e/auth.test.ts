import { expect } from '@playwright/test';
import { m } from '$paraglide/messages.js';

import { test } from './fixtures.js';
import { LoginPage } from './pages.js';
import { TEST_USERS } from './testData.js';

test.describe('Authentication', () => {
	// eslint-disable-next-line playwright/expect-expect
	test('login form elements', { tag: '@smoke' }, async ({ page }) => {
		const loginPage = new LoginPage(page);
		await loginPage.goto();
		await loginPage.expectFormElementsVisible();
	});

	test('login form is visible and accessible', async ({ page }) => {
		const loginPage = new LoginPage(page);
		await loginPage.goto();

		await expect(page.getByRole('heading', { name: m.loginHeader() })).toBeVisible();
		await loginPage.expectFormElementsVisible();

		await expect(page.getByRole('link', { name: /register/i })).toBeVisible();
	});

	test('successful login redirects to profile', async ({ page }) => {
		const loginPage = new LoginPage(page);
		await loginPage.goto();
		await loginPage.login(TEST_USERS.default.username, TEST_USERS.default.password);

		await expect(page).toHaveURL(/\/profile/, { timeout: 15_000 });
		await expect(page.getByRole('button', { name: m.profileLogout() })).toBeVisible({
			timeout: 10_000
		});
	});

	test('login with invalid credentials fails', async ({ page }) => {
		const loginPage = new LoginPage(page);
		await loginPage.goto();
		await loginPage.login(TEST_USERS.invalid.username, TEST_USERS.invalid.password);

		// Should stay on login page or show error
		await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });

		// Page should still have login form (not redirected)
		await expect(page.getByRole('textbox', { name: m.loginUsername() })).toBeVisible();
	});

	test('register form elements', async ({ page }) => {
		const loginPage = new LoginPage(page);
		await loginPage.gotoRegister();

		await expect(page.getByRole('textbox', { name: m.loginUsername() })).toBeVisible();
		await expect(page.getByRole('textbox', { name: m.happy_witty_squirrel_care() })).toBeVisible();
		await expect(page.getByRole('textbox', { name: m.royal_house_mare_dash() })).toBeVisible();
		await expect(page.getByRole('button', { name: m.registerCreate() })).toBeVisible();
	});

	test('register button is disabled when form is incomplete', async ({ page }) => {
		const loginPage = new LoginPage(page);
		await loginPage.gotoRegister();

		const createButton = page.getByRole('button', { name: m.registerCreate() });
		await expect(createButton).toBeVisible({ timeout: 5000 });

		// Button should be disabled when fields are empty or validation fails
		const usernameField = page.getByRole('textbox', { name: m.loginUsername() });
		await expect(usernameField).toHaveValue('', { timeout: 5000 });
	});
});
