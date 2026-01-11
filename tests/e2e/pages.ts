/* eslint-disable playwright/no-wait-for-timeout */
import { expect, type Page } from '@playwright/test';
import { m } from '$paraglide/messages.js';

export class LoginPage {
	private page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	async goto() {
		await this.page.goto('/login');
	}

	async login(username: string, password: string) {
		const usernameField = this.page.getByRole('textbox', { name: m.loginUsername() });
		const passwordField = this.page.getByRole('textbox', { name: m.loginPassword() });
		const loginButton = this.page.getByRole('button', { name: m.loginLogin(), exact: true });

		await expect(usernameField).toBeVisible();
		await expect(passwordField).toBeVisible();
		await expect(loginButton).toBeVisible();

		await usernameField.fill(username);
		await passwordField.fill(password);
		await loginButton.click();
	}

	async gotoRegister() {
		await this.page.goto('/register');
	}

	async register(username: string, password: string, confirmPassword: string) {
		const usernameField = this.page.getByRole('textbox', { name: m.loginUsername() });
		const passwordField = this.page.getByRole('textbox', { name: m.happy_witty_squirrel_care() });
		const confirmField = this.page.getByRole('textbox', { name: m.royal_house_mare_dash() });
		const createButton = this.page.getByRole('button', { name: m.registerCreate() });

		await expect(usernameField).toBeVisible();
		await expect(passwordField).toBeVisible();
		await expect(confirmField).toBeVisible();
		await expect(createButton).toBeVisible();

		await usernameField.fill(username);
		await passwordField.fill(password);
		await confirmField.fill(confirmPassword);
		await createButton.click();
	}

	async expectFormElementsVisible() {
		await expect(this.page.getByRole('textbox', { name: m.loginUsername() })).toBeVisible();
		await expect(this.page.getByRole('textbox', { name: m.loginPassword() })).toBeVisible();
		await expect(
			this.page.getByRole('button', { name: m.loginLogin(), exact: true })
		).toBeVisible();
	}

	async expectLoginErrorVisible() {
		// Wait for error message to appear (if validation fails)
		await expect(this.page.locator('[role="alert"], .text-red-500, .error')).toBeVisible();
	}
}

export class LobbyPage {
	private page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	async goto() {
		await this.page.goto('/lobbies');
	}

	async gotoNew() {
		await this.page.goto('/lobbies/new');
	}

	async createLobby(rounds: number, timerEnabled = false, timerSeconds = 0) {
		const roundsInput = this.page.getByRole('spinbutton', { name: m.totalRounds() });
		await expect(roundsInput).toBeVisible();
		await roundsInput.fill(rounds.toString());
		await expect(roundsInput).toHaveValue(rounds.toString());

		if (timerEnabled) {
			const timerSwitch = this.page.getByRole('switch', { name: m.such_spicy_cow_lend() });
			await expect(timerSwitch).toBeVisible();
			await timerSwitch.check();
			// Verify it's checked
			await expect(timerSwitch).toBeChecked();

			const timerSecondsThumb = this.page
				.locator('span[name="timerSeconds"]')
				.locator('span[data-slot="slider-thumb"]');

			await expect(timerSecondsThumb).toBeVisible();

			const box = await timerSecondsThumb.boundingBox();
			if (!box) {
				throw new Error('Could not find slider thumb bounding box');
			}

			const startX = box.x + box.width / 2;
			const startY = box.y + box.height / 2;

			// Move slider with delay to ensure interaction is registered
			await this.page.mouse.move(startX, startY);
			await this.page.waitForTimeout(100);
			await this.page.mouse.down();
			await this.page.waitForTimeout(50);
			await this.page.mouse.move(startX + timerSeconds, startY);
			await this.page.waitForTimeout(50);
			await this.page.mouse.up();
			await this.page.waitForTimeout(100);
		}

		const createButton = this.page.getByRole('button', { name: m.createLobby() });
		await expect(createButton).toBeVisible();
		await createButton.click();
	}

	async expectRedirectToLobby() {
		await this.page.waitForURL(/\/lobbies\/(?!new$)[a-z0-9-]+/, { timeout: 15_000 });
	}

	async getLobbyId(): Promise<string> {
		await this.page.waitForURL(
			(url: URL) => {
				const match = /^\/lobbies\/([a-zA-Z0-9-]+)$/.exec(url.pathname);
				return !!(match && match[1] !== 'new');
			},
			{ timeout: 15_000 }
		);
		const url = this.page.url();
		const matchResult = /\/lobbies\/([a-zA-Z0-9-]+)/.exec(url);
		const lobbyId = matchResult?.[1] ?? 'INVALID_ID';
		expect(lobbyId).not.toBe('INVALID_ID');
		expect(lobbyId).not.toBe('new');
		return lobbyId;
	}

	async join(lobbyId: string) {
		await this.page.goto(`/lobbies/${lobbyId}`);
		await expect(this.page).toHaveURL(new RegExp(`/lobbies/${lobbyId}`), { timeout: 15_000 });
		await expect(this.page.getByRole('heading', { name: /LOBBY/i })).toBeVisible({
			timeout: 10_000
		});
	}

	async expectStartButton(visible: boolean) {
		const startButton = this.page.getByRole('button', { name: m.play() });
		await expect(startButton)[visible ? 'toBeVisible' : 'toBeHidden']({ timeout: 10_000 });
	}

	async expectPlayerCount(expected: string) {
		await expect(this.page.getByText(new RegExp(`Players: ${expected}`))).toBeVisible({
			timeout: 15_000
		});
	}

	async startGame() {
		const startButton = this.page.getByRole('button', { name: m.play() });
		await expect(startButton).toBeVisible();
		await startButton.click();
	}
}

export class ProfilePage {
	private page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	async goto() {
		await this.page.goto('/profile');
	}

	async expectLoaded() {
		// eslint-disable-next-line playwright/no-networkidle
		await this.page.waitForLoadState('networkidle');

		await expect(this.page.getByRole('button', { name: m.profileLogout() })).toBeVisible();
	}

	async logout() {
		const logoutButton = this.page.getByRole('button', { name: m.profileLogout() });
		await expect(logoutButton).toBeVisible();
		await logoutButton.click();
	}
}

export class GamePage {
	private page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	async createQuickGame(rounds = 5) {
		await this.page.goto('/quick-game');

		// click on tabs does not work without this
		// eslint-disable-next-line playwright/no-networkidle
		await this.page.waitForLoadState('networkidle');

		const fastPlayTab = this.page.getByRole('tab', { name: m.singleFastGame() });
		const settingsTab = this.page.getByRole('tab', { name: m.singleSettings() });

		await expect(fastPlayTab).toBeVisible({ timeout: 10_000 });
		await expect(settingsTab).toBeVisible({ timeout: 10_000 });

		await settingsTab.click({ timeout: 10_000 });

		const roundsInput = this.page.getByRole('spinbutton');
		await roundsInput.waitFor({ state: 'visible', timeout: 2000 });

		await expect(roundsInput.first()).toBeVisible({ timeout: 10_000 });
		await roundsInput.first().fill(rounds.toString());

		await fastPlayTab.click({ timeout: 10_000 });

		const playButton = this.page.getByRole('button', { name: /play/i });
		await expect(playButton).toBeVisible({ timeout: 10_000 });
		await playButton.click();

		await this.page.waitForURL('**/singleplayer/**', { timeout: 15_000 });
	}

	async makeGuess() {
		const clickButton = this.page.getByRole('button', { name: m.clickOnMinimap() });
		await expect(clickButton).toBeVisible({ timeout: 10_000 });

		const minimap = this.page.locator('#minimap');
		await expect(minimap).toBeVisible({ timeout: 10_000 });
		await minimap.click({ position: { x: 100, y: 100 } });

		const guessButton = this.page.getByRole('button', { name: m.overlayGuess() });
		await expect(guessButton).toBeVisible({ timeout: 10_000 });
		await guessButton.click();
	}

	async expectGameStarted(rounds: number) {
		const roundText = `Round 1 of ${rounds.toString()}`;
		await expect(this.page.locator('#topRight').getByText(roundText)).toBeVisible({
			timeout: 10_000
		});
		await expect(this.page.locator('#topRight').getByText('Game score: 0')).toBeVisible();
	}

	async nextRound() {
		const nextRoundButton = this.page.getByText(m.overlayNextRound());
		await expect(nextRoundButton).toBeVisible({ timeout: 10_000 });
		await nextRoundButton.click();
	}

	async showResults() {
		const showResultsButton = this.page.getByRole('button', { name: m.weary_away_penguin_cure() });
		await expect(showResultsButton).toBeVisible({ timeout: 10_000 });
		await showResultsButton.click();
	}

	async expectRoundResultsVisible() {
		const scoreAndDistanceBlock = this.page.getByTestId('round-results-block');
		await expect(scoreAndDistanceBlock).toBeVisible({ timeout: 15_000 });
	}

	async expectMinimapResultsVisible(markerCount = 4) {
		await expect(this.page.locator('.leaflet-marker-icon')).toHaveCount(markerCount, {
			timeout: 10_000
		});
	}
}

export class MultiplayerGamePage {
	private page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	async expectRound(round: number, total: number) {
		const roundText = `Round ${String(round)} of ${String(total)}`;
		await expect(this.page.locator('#topRight').getByText(roundText)).toBeVisible({
			timeout: 30_000
		});
	}

	async makeGuess(x = 100, y = 100) {
		const clickButton = this.page.getByRole('button', { name: m.clickOnMinimap() });
		await expect(clickButton).toBeVisible({ timeout: 10_000 });

		const minimap = this.page.locator('#minimap');
		await expect(minimap).toBeVisible({ timeout: 10_000 });
		await minimap.click({ position: { x, y } });

		const guessButton = this.page.getByRole('button', { name: m.overlayGuess() });
		await expect(guessButton).toBeVisible({ timeout: 10_000 });
		await guessButton.click();
	}

	async expectWaitingForGuess() {
		const guessButton = this.page.getByRole('button', { name: m.overlayGuess() });
		await expect(guessButton).toBeHidden();
	}

	async expectResultsVisible() {
		const showResultsButton = this.page.getByRole('button', { name: m.weary_away_penguin_cure() });
		await expect(showResultsButton).toBeVisible({ timeout: 15_000 });
	}

	async showResults() {
		const showResultsButton = this.page.getByRole('button', { name: m.weary_away_penguin_cure() });
		await expect(showResultsButton).toBeVisible({ timeout: 10_000 });
		await showResultsButton.click();
	}

	async expectMarkersCount(count: number) {
		await expect(this.page.locator('.leaflet-marker-icon')).toHaveCount(count, {
			timeout: 15_000
		});
	}
}
