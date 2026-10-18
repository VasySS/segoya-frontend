/* eslint-disable @typescript-eslint/non-nullable-type-assertion-style */
import type {
	LatLng,
	MultiplayerGame,
	MultiplayerRound,
	SingleplayerGame,
	SingleplayerRound
} from '#lib/api/openapi.js';
import { getContext, setContext } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';

// https://www.youtube.com/watch?v=EyDV5XLfagg

type GameType = SingleplayerGame | MultiplayerGame;
type RoundType = SingleplayerRound | MultiplayerRound;

class GameContext {
	game = $state() as GameType;
	round = $state() as RoundType;
	// eslint-disable-next-line unicorn/no-null -- The API uses null for an absent guess.
	userGuess = $state<LatLng | null>(null);
	userPlacedMarker = $state(false);
	userGuessed = $state(false);
	guessPending = $state(false);
	guessPresence = new SvelteMap<number, boolean>();
	isLoading = $state(false);

	constructor(game: GameType, round: RoundType) {
		this.game = game;
		this.round = round;
	}

	canSubmitGuess(): boolean {
		if (this.userGuessed || this.guessPending || this.round.finished || this.game.finished) {
			return false;
		}

		return Temporal.Instant.compare(
			Temporal.Now.instant(),
			Temporal.Instant.from(this.round.startedAt)
		) >= 0;
	}

	recordGuess() {
		this.guessPresence.set(this.round.roundNum, this.userGuess !== null);
		this.userGuessed = true;
		this.guessPending = false;
	}

	// used to reset states for new round
	resetUserStates() {
		this.userPlacedMarker = false;
		this.userGuessed = false;
		this.guessPending = false;
		// eslint-disable-next-line unicorn/no-null -- Clear the guess for the next round.
		this.userGuess = null;
	}
}

const gameContextKey = Symbol('game');

export function setGameContext(game: GameType, round: RoundType): GameContext {
	const gameContext = new GameContext(game, round);
	setContext(gameContextKey, gameContext);
	return gameContext;
}

export function getGameContext(): GameContext {
	return getContext(gameContextKey);
}
