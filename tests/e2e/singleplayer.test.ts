/* eslint-disable playwright/expect-expect */
import { expect } from '@playwright/test';
import { m } from '#paraglide/messages.js';

import { test } from './fixtures.js';
import { GamePage } from './pages.js';

test.describe('Game Interactions', () => {
	test('minimap controls and mouse hover do not place a guess', async ({
		authenticatedPage: page
	}) => {
		await new GamePage(page).createQuickGame();
		const minimap = page.locator('#minimap');
		await expect(minimap.locator('.leaflet-control-zoom')).toBeVisible();
		await page.mouse.move(0, 0);
		await expect(minimap).toHaveAttribute('style', /width: 20%/);
		await minimap.dispatchEvent('pointerover', { pointerType: 'touch', bubbles: true });
		await expect(minimap).toHaveAttribute('style', /width: 20%/);
		await minimap.hover();
		await expect(minimap).toHaveAttribute('style', /width: 35%/);
		await page.mouse.move(0, 0);
		await expect(minimap).toHaveAttribute('style', /width: 20%/);

		await minimap.getByRole('button', { name: 'Zoom in', exact: true }).click();
		await minimap.getByRole('button', { name: 'Zoom out', exact: true }).click();
		await minimap.getByTitle(m.minimapChangeSize()).click();
		await expect(minimap).toHaveAttribute('style', /width: 50%/);
		await page.mouse.move(0, 0);
		await expect(minimap).toHaveAttribute('style', /width: 50%/);
		await minimap.getByTitle(m.minimapChangeSize()).click();
		await expect(minimap).toHaveAttribute('style', /width: 20%/);
		await expect(minimap.locator('.leaflet-marker-icon')).toHaveCount(0);
		await expect(page.getByRole('button', { name: m.clickOnMinimap() })).toBeVisible();
	});

	test('minimap replaces a guess and freezes it during submission and round results', async ({
		authenticatedPage: page
	}) => {
		const gamePage = new GamePage(page);
		await gamePage.createQuickGame();
		const minimap = page.locator('#minimap');
		await minimap.getByTitle(m.minimapChangeSize()).click();
		await expect(minimap).toHaveAttribute('style', /width: 50%/);
		await minimap.click({ position: { x: 100, y: 100 } });
		const marker = minimap.locator('.leaflet-marker-icon');
		await expect(marker).toHaveCount(1);
		const firstPosition = await marker.getAttribute('style');
		await minimap.click({ position: { x: 200, y: 150 } });
		await expect(marker).toHaveCount(1);
		await expect(marker).not.toHaveAttribute('style', firstPosition ?? '');
		const submittedPosition = await marker.getAttribute('style');

		const { promise: pending, resolve: resumeRequest } = Promise.withResolvers<undefined>();
		await page.route('**/v1/singleplayer/*/round/end', async (route) => {
			await pending;
			await route.continue();
		});
		const request = page.waitForRequest('**/v1/singleplayer/*/round/end');
		await page.getByRole('button', { name: m.overlayGuess(), exact: true }).click();
		await request;
		try {
			await minimap.click({ position: { x: 300, y: 200 } });
			await expect(marker).toHaveCount(1);
			await expect(marker).toHaveAttribute('style', submittedPosition ?? '');
		} finally {
			resumeRequest(undefined);
		}
		await gamePage.expectRoundResultsVisible();
		await expect(marker).toHaveCount(2);
		await expect(minimap.locator('path[stroke-dasharray]')).toHaveCount(2);
		await minimap.click({ position: { x: 100, y: 100 } });
		await expect(marker).toHaveCount(2);
	});

	test('minimap switches providers and initializes cleanly after returning to the game', async ({
		authenticatedPage: page
	}) => {
		await new GamePage(page).createQuickGame();
		const gameURL = page.url();
		const minimap = page.locator('#minimap');
		await page.getByTitle(m.singleSettings(), { exact: true }).click();
		await page.getByRole('combobox', { name: m.profileMinimapProvider() }).click();
		await page.getByRole('option', { name: 'ESRI', exact: true }).click();
		await page.keyboard.press('Escape');
		await expect(minimap.locator('.leaflet-control-attribution')).toContainText('Esri');
		await expect(minimap.locator('img.leaflet-tile').first()).toHaveAttribute(
			'src',
			/server\.arcgisonline\.com/
		);
		await page.goto('/quick-game');
		await page.goto(gameURL);
		await expect(minimap.locator('.leaflet-control-zoom')).toHaveCount(1);
		await expect(minimap.locator('.leaflet-control-attribution')).toHaveCount(1);
		await expect(minimap.locator('.leaflet-control-attribution')).toContainText('Esri');
		await page.getByTitle(m.singleSettings(), { exact: true }).click();
		await page.getByRole('combobox', { name: m.profileMinimapProvider() }).click();
		await page.getByRole('option', { name: 'OpenStreetMap', exact: true }).click();
		await page.keyboard.press('Escape');
		await expect(minimap.locator('.leaflet-control-attribution')).not.toContainText('Esri');
		await expect(minimap.locator('img.leaflet-tile').first()).toHaveAttribute(
			'src',
			/\.tile\.openstreetmap\.org/
		);
	});

	test('singleplayer game is created and loaded', async ({ authenticatedPage: page }) => {
		const gamePage = new GamePage(page);
		await gamePage.createQuickGame(7);
		await gamePage.expectGameStarted(7);
	});

	test('singleplayer game loads with correct round display', async ({
		authenticatedPage: page
	}) => {
		const gamePage = new GamePage(page);
		const rounds = 3;

		await gamePage.createQuickGame(rounds);
		await gamePage.expectGameStarted(rounds);

		await expect(page.locator('#minimap')).toBeVisible({ timeout: 10_000 });
	});

	test('singleplayer game guess is made successfully', async ({ authenticatedPage: page }) => {
		const gamePage = new GamePage(page);
		await gamePage.createQuickGame();
		await gamePage.makeGuess();

		// Verify the game is no longer in the "click on minimap" state
		// The results should be visible after guess
		await gamePage.expectRoundResultsVisible();
	});

	test('singleplayer game finishes (2 rounds) and shows results', async ({
		authenticatedPage: page
	}) => {
		const gamePage = new GamePage(page);
		await gamePage.createQuickGame(2);

		// Round 1
		await gamePage.expectGameStarted(2);
		await gamePage.makeGuess();
		await gamePage.expectRoundResultsVisible();
		await gamePage.nextRound();

		// Round 2
		await gamePage.makeGuess();
		await gamePage.showResults();
		await gamePage.expectMinimapResultsVisible(4);
	});

	test('singleplayer game with 5 rounds completes all rounds', async ({
		authenticatedPage: page
	}) => {
		const gamePage = new GamePage(page);
		const totalRounds = 5;
		await gamePage.createQuickGame(totalRounds);

		await gamePage.expectGameStarted(totalRounds);

		// Play through all rounds except the last
		for (let round = 1; round < totalRounds; round++) {
			await gamePage.makeGuess();
			await gamePage.expectRoundResultsVisible();

			// eslint-disable-next-line playwright/no-conditional-in-test
			if (round < totalRounds) {
				await gamePage.nextRound();
			}
		}

		// final round doesn't have a "next round" button and round results
		await gamePage.makeGuess();
		await gamePage.showResults();
		// Verify we have results - 5 rounds means 10 markers (2 per round)
		await gamePage.expectMinimapResultsVisible(10);
	});
});
