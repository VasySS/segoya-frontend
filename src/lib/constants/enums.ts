export const GameType = {
	SINGLEPLAYER: 'singleplayer',
	MULTIPLAYER: 'multiplayer'
} as const;

export type GameTypeValues = (typeof GameType)[keyof typeof GameType];

export const APIKeys = {
	YANDEX: 'yandexKey',
	GOOGLE: 'googleKey',
	SEZNAM: 'seznamKey'
} as const;
