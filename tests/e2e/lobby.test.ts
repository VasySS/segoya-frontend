import { expect } from '@playwright/test';
import { m } from '$paraglide/messages.js';

import { test } from './fixtures.js';
import { LobbyPage } from './pages.js';
import { LOBBY_SETTINGS } from './testData.js';

test.describe('Lobby Features', () => {
	test('lobby list redirects (unauthenticated)', async ({ page }) => {
		const lobbyPage = new LobbyPage(page);
		await lobbyPage.goto();

		await expect(page.getByRole('heading', { name: m.loginHeader() })).toBeVisible({
			timeout: 10_000
		});
	});

	test(
		'create lobby form works when authenticated',
		{ tag: '@smoke' },
		async ({ authenticatedPage }) => {
			const lobbyPage = new LobbyPage(authenticatedPage);

			await test.step('Navigate to create lobby page', async () => {
				await lobbyPage.gotoNew();
				// Verify we're on the create page
				await expect(authenticatedPage).toHaveURL(/\/lobbies\/new/);
			});

			await test.step('Fill and submit lobby form', async () => {
				await lobbyPage.createLobby(
					LOBBY_SETTINGS.default.rounds,
					LOBBY_SETTINGS.default.spicy,
					LOBBY_SETTINGS.default.timerSeconds
				);
			});

			await test.step('Verify redirect to lobby', async () => {
				await lobbyPage.expectRedirectToLobby();
			});
		}
	);

	test('create lobby with different settings', async ({ authenticatedPage }) => {
		const lobbyPage = new LobbyPage(authenticatedPage);

		await test.step('Navigate to create lobby page', async () => {
			await lobbyPage.gotoNew();
			await expect(authenticatedPage).toHaveURL(/\/lobbies\/new/);
		});

		await test.step('Fill form with custom settings', async () => {
			await lobbyPage.createLobby(
				LOBBY_SETTINGS.custom.rounds,
				LOBBY_SETTINGS.custom.spicy,
				LOBBY_SETTINGS.custom.timerSeconds
			);
		});

		await test.step('Verify successful lobby creation', async () => {
			await lobbyPage.expectRedirectToLobby();
		});
	});

	test('lobby page shows form elements', async ({ authenticatedPage }) => {
		const lobbyPage = new LobbyPage(authenticatedPage);
		await lobbyPage.gotoNew();

		// Verify form elements are visible
		await expect(authenticatedPage.getByTestId('provider-select')).toBeVisible();
		await expect(
			authenticatedPage.getByRole('spinbutton', { name: m.totalRounds() })
		).toBeVisible();
		await expect(
			authenticatedPage.getByRole('switch', { name: m.such_spicy_cow_lend() })
		).toBeVisible();
		await expect(authenticatedPage.getByRole('button', { name: m.createLobby() })).toBeVisible();
	});
});
