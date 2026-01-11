import { expect } from '@playwright/test';
import { m } from '$paraglide/messages.js';

import { test } from './fixtures.js';
import { ProfilePage } from './pages.js';

test.describe('Profile and Settings', () => {
	test('profile page redirects to login (unauthenticated)', async ({ page }) => {
		const profilePage = new ProfilePage(page);
		await profilePage.goto();

		await expect(page.getByRole('heading', { name: m.loginHeader() })).toBeVisible({
			timeout: 10_000
		});
	});

	// eslint-disable-next-line playwright/expect-expect
	test('profile loads when authenticated', { tag: '@smoke' }, async ({ authenticatedPage }) => {
		const profilePage = new ProfilePage(authenticatedPage);
		await profilePage.goto();
		await profilePage.expectLoaded();
	});

	test('logout clears authentication state', async ({ authenticatedPage }) => {
		const profilePage = new ProfilePage(authenticatedPage);
		await profilePage.goto();
		await profilePage.expectLoaded();

		await profilePage.logout();
		await expect(authenticatedPage).toHaveURL(/\/login/, { timeout: 15_000 });

		// Try to access profile again - should redirect to login
		await authenticatedPage.goto('/profile');
		await expect(authenticatedPage.getByRole('heading', { name: m.loginHeader() })).toBeVisible({
			timeout: 10_000
		});
	});
});
