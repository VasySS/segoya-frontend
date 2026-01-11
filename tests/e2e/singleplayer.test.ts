/* eslint-disable playwright/expect-expect */
import { expect } from '@playwright/test';

import { test } from './fixtures.js';
import { GamePage } from './pages.js';

test.describe('Game Interactions', () => {
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
