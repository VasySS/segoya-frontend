/* eslint-disable unicorn/prefer-global-this -- Keyboard events target the browser window. */
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { GameType } from '#lib/constants/enums.js';
import type { getGameContext } from '#lib/states/gameContext.svelte.js';
import { m } from '#paraglide/messages.js';
import { describe, expect, it, vi } from 'vitest';
import Settings from '#components/game/Settings.svelte';
import type PanoramaContainer from '#components/panoramas/PanoramaContainer.svelte';

import BaseOverlay from './BaseOverlay.svelte';

const { gameContext } = vi.hoisted(() => ({
	gameContext: {
		game: { finished: false },
		round: { finished: false },
		userPlacedMarker: false,
		userGuessed: false,
		guessPending: false
	}
}));

vi.mock(import('#lib/states/gameContext.svelte.js'), () => ({
	getGameContext: () => gameContext as ReturnType<typeof getGameContext>
}));
vi.mock(import('#components/game/Settings.svelte'), () => ({ default: vi.fn<typeof Settings>() }));
vi.mock(import('#components/panoramas/PanoramaContainer.svelte'), () => ({
	default: vi.fn<typeof PanoramaContainer>()
}));

describe.each([GameType.SINGLEPLAYER, GameType.MULTIPLAYER])('space shortcut in %s', (gameType) => {
	it('loads Settings on demand and forwards the map provider callback', async () => {
		expect.hasAssertions();

		vi.mocked(Settings).mockClear();
		const setTileProvider = vi.fn<(provider: string) => void>();
		render(BaseOverlay, { gameType, sendGuess: vi.fn<() => Promise<void>>(), setTileProvider });

		expect(Settings).not.toHaveBeenCalled();

		await fireEvent.click(screen.getByTitle(m.singleSettings()));
		await waitFor(() => {
			expect(Settings).toHaveBeenCalledTimes(1);
		});

		expect(vi.mocked(Settings).mock.calls[0]?.[1]).toMatchObject({
			isSettingsOpen: true,
			setTileProvider
		});
	});

	it('requires a minimap selection in each round', async () => {
		expect.hasAssertions();

		gameContext.userPlacedMarker = false;
		const sendGuess = vi.fn<() => Promise<void>>().mockResolvedValue();
		render(BaseOverlay, { gameType, sendGuess, setTileProvider: undefined });

		await fireEvent(window, new KeyboardEvent('keydown', { code: 'Space' }));

		expect(sendGuess).toHaveBeenCalledTimes(0);

		gameContext.userPlacedMarker = true;
		await fireEvent(window, new KeyboardEvent('keydown', { code: 'Space' }));

		expect(sendGuess).toHaveBeenCalledExactlyOnceWith();

		await fireEvent(window, new KeyboardEvent('keydown', { code: 'Space', repeat: true }));

		expect(sendGuess).toHaveBeenCalledTimes(1);

		gameContext.userPlacedMarker = false;
		await fireEvent(window, new KeyboardEvent('keydown', { code: 'Space' }));

		expect(sendGuess).toHaveBeenCalledTimes(1);
	});
});
