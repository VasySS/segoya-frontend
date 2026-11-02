/* eslint-disable testing-library/no-node-access -- Verify the DOM rendered and managed by Leaflet. */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/svelte';
import type { MultiplayerGuess, SingleplayerGuess, UserPublicProfile } from '#lib/api/openapi.js';
import type { getGameContext } from '#lib/states/gameContext.svelte.js';
import { m } from '#paraglide/messages.js';
import { describe, expect, it, vi } from 'vitest';

import Minimap from './Minimap.svelte';

interface MinimapControls {
	setTileProvider(provider: string): void;
	showSingleplayerGameEndMarkers(guesses: SingleplayerGuess[]): Promise<void>;
	showMultiplayerGameEndMarkers(guesses: MultiplayerGuess[]): Promise<void>;
}

const { gameContext } = vi.hoisted(() => {
	vi.stubGlobal('matchMedia', (query: string) => ({
		matches: query === '(min-width: 800px)',
		addEventListener: vi.fn<MediaQueryList['addEventListener']>(),
		removeEventListener: vi.fn<MediaQueryList['removeEventListener']>()
	}));

	return {
		gameContext: {
			game: { provider: 'google' },
			userGuess: undefined as { lat: number; lng: number } | undefined,
			userPlacedMarker: false,
			userGuessed: false,
			guessPending: false,
			guessPresence: new Map<number, boolean>()
		}
	};
});

vi.mock(import('#lib/states/gameContext.svelte.js'), () => ({
	getGameContext: () => gameContext as ReturnType<typeof getGameContext>
}));

const user: UserPublicProfile = {
	id: '00000000-0000-4000-8000-000000000001',
	username: 'player',
	name: 'Player',
	avatarHash: '',
	registerDate: '2026-01-01T00:00:00Z'
};

async function renderMap() {
	gameContext.userGuess = undefined;
	gameContext.userPlacedMarker = false;
	gameContext.userGuessed = false;
	gameContext.guessPending = false;
	gameContext.guessPresence.clear();
	const view = render(Minimap, { user });
	const map = await screen.findByRole('region', { name: 'Map' });
	return { ...view, component: view.component as MinimapControls, map };
}

describe('leaflet minimap integration', () => {
	it('places and replaces a single marker with plain API coordinates', async () => {
		expect.hasAssertions();

		const { map } = await renderMap();
		await fireEvent.click(map, { clientX: 100, clientY: 100 });
		const first = gameContext.userGuess;
		await fireEvent.click(map, { clientX: 150, clientY: 120 });

		expect(gameContext.userGuess).not.toStrictEqual(first);
		expect(Object.getPrototypeOf(gameContext.userGuess)).toBe(Object.prototype);
		expect(gameContext.userPlacedMarker).toBe(true);
		expect(map.querySelectorAll('.leaflet-marker-icon')).toHaveLength(1);
	});

	it.each(['guessPending', 'userGuessed'] as const)(
		'keeps the guess fixed while %s',
		async (flag) => {
			expect.hasAssertions();

			const { map } = await renderMap();
			await fireEvent.click(map, { clientX: 100, clientY: 100 });
			const guess = gameContext.userGuess;
			gameContext[flag] = true;
			await fireEvent.click(map, { clientX: 150, clientY: 120 });

			expect(gameContext.userGuess).toBe(guess);
			expect(map.querySelectorAll('.leaflet-marker-icon')).toHaveLength(1);
		}
	);

	it('keeps zoom and size-control clicks out of guess placement', async () => {
		expect.hasAssertions();

		const { map } = await renderMap();
		await fireEvent.click(within(map).getByTitle('Zoom in'));
		await fireEvent.click(within(map).getByTitle('Zoom out'));
		await fireEvent.click(within(map).getByTitle(m.minimapChangeSize()));
		await waitFor(() => {
			expect(map.style.width).toBe('50%');
		});

		expect(gameContext.userPlacedMarker).toBe(false);
		expect(map.querySelectorAll('.leaflet-marker-icon')).toHaveLength(0);
	});

	it('expands and shrinks on mouse hover', async () => {
		expect.hasAssertions();

		const { map } = await renderMap();
		await fireEvent(map, new PointerEvent('pointerover', { pointerType: 'mouse', bubbles: true }));
		await waitFor(() => {
			expect(map.style.width).toBe('35%');
		});
		await fireEvent(map, new PointerEvent('pointerout', { pointerType: 'mouse', bubbles: true }));
		await waitFor(() => {
			expect(map.style.width).toBe('20%');
		});
	});

	it.each(['touch', 'pen'])('ignores %s hover events', async (pointerType) => {
		expect.hasAssertions();

		const { map } = await renderMap();
		await fireEvent(map, new PointerEvent('pointerover', { pointerType, bubbles: true }));

		expect(map.style.width).toBe('20%');

		await fireEvent(map, new PointerEvent('pointerout', { pointerType, bubbles: true }));

		expect(map.style.width).toBe('20%');
	});

	it('switches tiles and attribution and falls back to OSM for unknown providers', async () => {
		expect.hasAssertions();

		const { component, map } = await renderMap();
		component.setTileProvider('esri');

		expect(map.querySelector('.leaflet-control-attribution')).toHaveTextContent('Esri');
		expect(map.querySelector('img.leaflet-tile')).toHaveAttribute(
			'src',
			expect.stringContaining('server.arcgisonline.com')
		);

		component.setTileProvider('unknown');

		expect(map.querySelector('.leaflet-control-attribution')).not.toHaveTextContent('Esri');
		expect(map.querySelector('img.leaflet-tile')).toHaveAttribute(
			'src',
			expect.stringContaining('.tile.openstreetmap.org')
		);
	});

	it('recreates the map for results, preserving zero-coordinate guesses, lines and tooltips', async () => {
		expect.hasAssertions();

		const { component, map } = await renderMap();
		gameContext.guessPresence.set(1, true);
		await component.showSingleplayerGameEndMarkers([
			{
				roundNum: 1,
				roundLat: 10,
				roundLng: 20,
				guessLat: 0,
				guessLng: 0,
				score: 0,
				missDistance: 0
			}
		]);

		expect(map.querySelectorAll('.leaflet-marker-icon')).toHaveLength(2);
		expect(map.querySelectorAll('path[stroke-dasharray="10, 10"]')).toHaveLength(2);
		expect(map.querySelectorAll('.leaflet-control-zoom')).toHaveLength(1);
		expect(map.querySelectorAll('.leaflet-control-attribution')).toHaveLength(1);

		const marker = within(map).getByRole('button', { name: '1' });
		await fireEvent(
			marker,
			new PointerEvent('pointerover', { pointerType: 'mouse', bubbles: true })
		);

		const tooltip = await screen.findByRole('tooltip');

		expect(tooltip).toHaveTextContent('0');
	});

	it('highlights multiplayer rounds only for mouse pointers and restores all results on exit', async () => {
		expect.hasAssertions();

		const { component, map } = await renderMap();
		await component.showMultiplayerGameEndMarkers([
			{
				username: 'one',
				avatarHash: '',
				roundNum: 1,
				roundLat: 10,
				roundLng: 20,
				lat: 11,
				lng: 21,
				score: 100
			},
			{
				username: 'two',
				avatarHash: '',
				roundNum: 2,
				roundLat: -10,
				roundLng: -20,
				lat: -11,
				lng: -21,
				score: 200
			}
		]);
		const marker = within(map).getByRole('button', { name: '1' });
		await fireEvent(
			marker,
			new PointerEvent('pointerover', { pointerType: 'touch', bubbles: true })
		);

		expect(map.querySelectorAll('.leaflet-marker-icon')).toHaveLength(4);

		await fireEvent(
			marker,
			new PointerEvent('pointerover', { pointerType: 'mouse', bubbles: true })
		);

		expect(map.querySelectorAll('.leaflet-marker-icon')).toHaveLength(2);
		expect(map.querySelectorAll('path[stroke-dasharray="10, 10"]')).toHaveLength(2);

		const tooltip = await screen.findByRole('tooltip');

		expect(tooltip).toHaveTextContent('one');

		await fireEvent(
			marker,
			new PointerEvent('pointerout', { pointerType: 'mouse', bubbles: true })
		);

		expect(map.querySelectorAll('.leaflet-marker-icon')).toHaveLength(4);

		await waitFor(() => {
			expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
		});
	});

	it('can unmount and mount again without leaving duplicate maps or controls', async () => {
		expect.hasAssertions();

		const { unmount } = await renderMap();
		unmount();
		const { map } = await renderMap();

		expect(screen.getAllByRole('region', { name: 'Map' })).toHaveLength(1);
		expect(map.querySelectorAll('.leaflet-control-zoom')).toHaveLength(1);
		expect(map.querySelectorAll('.leaflet-control-attribution')).toHaveLength(1);
	});
});
