import { expect, type BrowserContext } from '@playwright/test';

import { addAuthenticationToPage, test } from './fixtures.js';
import { LobbyPage, LoginPage, MultiplayerGamePage } from './pages.js';
import { TEST_USERS } from './testData.js';

async function createBrowserContext(context: BrowserContext): Promise<BrowserContext> {
	const browser = context.browser();

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	return browser!.newContext();
}

async function createNewPage(context: BrowserContext, username: string, password: string) {
	const page = await context.newPage();
	await addAuthenticationToPage(page, username, password);

	return page;
}

test.describe('Multiplayer Game', () => {
	test('two players create lobby, join, start game, and complete a round', async ({
		authenticatedPage: page1,
		context
	}) => {
		const page2Context = await createBrowserContext(context);
		const page2 = await page2Context.newPage();
		await page2
			.context()
			.addCookies([{ name: 'PARAGLIDE_LOCAL', value: 'en', url: 'http://localhost:5173' }]);
		const lobbyPage = new LobbyPage(page1);
		let gamePage1: MultiplayerGamePage;
		let gamePage2: MultiplayerGamePage;

		await test.step('Player 1 creates a lobby with 2 rounds', async () => {
			await lobbyPage.gotoNew();
			await lobbyPage.createLobby(2);
		});

		let lobbyId: string;

		await test.step('Extract lobby ID', async () => {
			lobbyId = await lobbyPage.getLobbyId();
		});

		await test.step('Verify start button is not visible with 1 player', async () => {
			await lobbyPage.expectStartButton(false);

			await expect(page1.getByText(/At least 2 players are needed/i)).toBeVisible();
		});

		await test.step('Player 2 authenticates and joins the lobby', async () => {
			const loginPage = new LoginPage(page2);
			await loginPage.goto();
			await loginPage.login(TEST_USERS.player2.username, TEST_USERS.player2.password);

			await page2.waitForURL('**/profile', { timeout: 15_000 });
			const lobbyPage2 = new LobbyPage(page2);
			await lobbyPage2.join(lobbyId);
		});

		await test.step('Verify both players are in the lobby', async () => {
			await lobbyPage.expectPlayerCount('2/10');
			await expect(page2.getByText(/Players: 2\/10/)).toBeVisible({ timeout: 10_000 });
		});

		await test.step('Verify start button is visible with 2 players', async () => {
			await lobbyPage.expectStartButton(true);
		});

		await test.step('Player 1 starts the game', async () => {
			await lobbyPage.startGame();
		});

		await test.step('Both players transition to game page', async () => {
			await page1.waitForURL(/\/multiplayer\//, { timeout: 15_000 });
			await page2.waitForURL(/\/multiplayer\//, { timeout: 15_000 });

			gamePage1 = new MultiplayerGamePage(page1);
			gamePage2 = new MultiplayerGamePage(page2);
		});

		await test.step('Verify game started - Round 1 of 2', async () => {
			await gamePage1.expectRound(1, 2);
			await gamePage2.expectRound(1, 2);
		});

		await test.step('Player 1 places a marker on map and guesses', async () => {
			await gamePage1.makeGuess(100, 100);
		});

		await test.step('Verify round is waiting for Player 2 guess', async () => {
			await gamePage1.expectWaitingForGuess();
		});

		await test.step('Player 2 places a marker on map and guesses', async () => {
			await gamePage2.makeGuess(100, 100);
		});

		await test.step('Verify round results show location marker and both player markers', async () => {
			await gamePage1.expectMarkersCount(3);
			await gamePage2.expectMarkersCount(3);
		});

		await test.step('Wait for next round to start', async () => {
			// Should automatically transition to Round 2
			await gamePage1.expectRound(2, 2);
			await gamePage2.expectRound(2, 2);
		});

		// Clean up page 2 context
		await page2Context.close();
	});

	// eslint-disable-next-line playwright/expect-expect
	test('game completes all rounds and shows final results', async ({
		authenticatedPage: page1,
		context
	}) => {
		const page2Context = await createBrowserContext(context);
		const page2 = await createNewPage(
			page2Context,
			TEST_USERS.player2.username,
			TEST_USERS.player2.password
		);

		const lobbyPage = new LobbyPage(page1);
		const lobbyPage2 = new LobbyPage(page2);
		let gamePage1: MultiplayerGamePage;
		let gamePage2: MultiplayerGamePage;

		// Create lobby with 1 round
		await test.step('Create lobby with 1 round', async () => {
			await lobbyPage.gotoNew();
			await lobbyPage.createLobby(1);
		});

		let lobbyId: string;

		await test.step('Extract lobby ID', async () => {
			lobbyId = await lobbyPage.getLobbyId();
		});

		// Player 2 joins
		await test.step('Player 2 joins the lobby', async () => {
			await lobbyPage2.join(lobbyId);
		});

		// Start game
		await test.step('Start the game', async () => {
			await lobbyPage.startGame();
		});

		await test.step('Both players transition to game', async () => {
			await page1.waitForURL(/\/multiplayer\//, { timeout: 15_000 });
			await page2.waitForURL(/\/multiplayer\//, { timeout: 15_000 });

			gamePage1 = new MultiplayerGamePage(page1);
			gamePage2 = new MultiplayerGamePage(page2);
		});

		// Both players guess
		await test.step('Both players make guesses', async () => {
			await gamePage1.makeGuess(100, 100);
			await gamePage2.makeGuess(100, 100);
		});

		// Verify game shows results after final round
		await test.step('Verify game results are displayed', async () => {
			await gamePage1.expectResultsVisible();
			await gamePage2.expectResultsVisible();
		});

		// Both players show results
		await test.step('Both players show final results', async () => {
			await gamePage1.showResults();
			await gamePage2.showResults();

			// Verify markers are shown on map (location + 2 guesses)
			await gamePage1.expectMarkersCount(3);
			await gamePage2.expectMarkersCount(3);
		});

		await page2Context.close();
	});

	test('lobby requires minimum 2 players to start game', async ({
		authenticatedPage: page1,
		context
	}) => {
		const lobbyPage = new LobbyPage(page1);

		await test.step('Create a new lobby', async () => {
			await lobbyPage.gotoNew();
			await lobbyPage.createLobby(3);
		});

		await test.step('Verify start button is disabled with 1 player', async () => {
			await lobbyPage.expectStartButton(false);
			await expect(page1.getByText(/At least 2 players are needed/i)).toBeVisible();
		});

		// Now have player 2 join
		let lobbyId: string;

		await test.step('Extract lobby ID', async () => {
			lobbyId = await lobbyPage.getLobbyId();
		});

		const page2Context = await createBrowserContext(context);
		const page2 = await createNewPage(
			page2Context,
			TEST_USERS.player2.username,
			TEST_USERS.player2.password
		);
		const lobbyPage2 = new LobbyPage(page2);

		await test.step('Player 2 joins lobby', async () => {
			await lobbyPage2.join(lobbyId);
		});

		await test.step('Verify start button is now visible with 2 players', async () => {
			await lobbyPage.expectStartButton(true);
		});

		await page2Context.close();
	});

	// eslint-disable-next-line playwright/expect-expect
	test('multiple players can join the same lobby', async ({
		authenticatedPage: page1,
		context
	}) => {
		const lobbyPage = new LobbyPage(page1);

		await test.step('Create lobby', async () => {
			await lobbyPage.gotoNew();
			await lobbyPage.createLobby(2);
		});

		let lobbyId: string;

		await test.step('Extract lobby ID', async () => {
			lobbyId = await lobbyPage.getLobbyId();
		});

		const page2Context = await createBrowserContext(context);
		const page2 = await createNewPage(
			page2Context,
			TEST_USERS.player2.username,
			TEST_USERS.player2.password
		);
		const lobbyPage2 = new LobbyPage(page2);

		await test.step('Player 2 joins', async () => {
			await lobbyPage2.join(lobbyId);
		});

		await test.step('Verify lobby shows correct player count', async () => {
			await lobbyPage.expectPlayerCount('2/10');
			await lobbyPage2.expectPlayerCount('2/10');
		});

		await test.step('Game can be started with 2 players', async () => {
			await lobbyPage.expectStartButton(true);
		});

		await page2Context.close();
	});

	// eslint-disable-next-line playwright/expect-expect
	test('player can rejoin lobby after disconnect', async ({
		authenticatedPage: page1,
		context
	}) => {
		const lobbyPage = new LobbyPage(page1);

		await test.step('Create lobby', async () => {
			await lobbyPage.gotoNew();
			await lobbyPage.createLobby(2);
		});

		let lobbyId: string;

		await test.step('Extract lobby ID', async () => {
			lobbyId = await lobbyPage.getLobbyId();
		});

		const page2Context = await createBrowserContext(context);
		const page2 = await createNewPage(
			page2Context,
			TEST_USERS.player2.username,
			TEST_USERS.player2.password
		);
		const lobbyPage2 = new LobbyPage(page2);

		await test.step('Player 2 joins lobby', async () => {
			await lobbyPage2.join(lobbyId);
		});

		await test.step('Verify both players are in lobby', async () => {
			await lobbyPage.expectPlayerCount('2/10');
		});

		await test.step('Player 2 closes connection', async () => {
			await page2Context.close();
		});

		await test.step('Player 2 reconnects to same lobby', async () => {
			const page2NewContext = await createBrowserContext(context);
			const page2New = await createNewPage(
				page2NewContext,
				TEST_USERS.player2.username,
				TEST_USERS.player2.password
			);
			const lobbyPage2New = new LobbyPage(page2New);

			await lobbyPage2New.join(lobbyId);
			await page2NewContext.close();
		});
	});
});
