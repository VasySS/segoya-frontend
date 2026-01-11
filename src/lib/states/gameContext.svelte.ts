/* eslint-disable @typescript-eslint/non-nullable-type-assertion-style */
import type {
	LatLng,
	MultiplayerGame,
	MultiplayerRound,
	SingleplayerGame,
	SingleplayerRound
} from '$lib/api/openapi';
import { getContext, setContext } from 'svelte';

// https://www.youtube.com/watch?v=EyDV5XLfagg

type GameType = SingleplayerGame | MultiplayerGame;
type RoundType = SingleplayerRound | MultiplayerRound;

class GameContext {
	game = $state() as GameType;
	round = $state() as RoundType;
	userGuess = $state() as LatLng;
	userPlacedMarker = $state(false);
	userGuessed = $state(false);
	isLoading = $state(false);

	constructor(game: GameType, round: RoundType) {
		this.game = game;
		this.round = round;
		this.userGuess = { lat: 0, lng: 0 };
	}

	// used to reset states for new round
	resetUserStates() {
		this.userPlacedMarker = false;
		this.userGuessed = false;
		this.userGuess = { lat: 0, lng: 0 };
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
