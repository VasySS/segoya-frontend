import type {
	WebSocketInputMessage,
	WebSocketOutputMessage
} from '$components/shared/websocket/types';
import type { LatLng, MultiplayerGuess } from '$lib/api/openapi';
import type { MultiplayerUser } from '$lib/types/user';

export interface ConnectedUsersMessage extends WebSocketInputMessage {
	type: 'usersConnected';
	payload: {
		users: MultiplayerUser[];
	};
}

export interface UserJoinMessage extends WebSocketInputMessage {
	type: 'userConnected';
	payload: {
		user: MultiplayerUser;
	};
}

export interface UserLeftMessage extends WebSocketInputMessage {
	type: 'userDisconnected';
	payload: {
		username: string;
	};
}

export interface UserGuessedMessage extends WebSocketInputMessage {
	type: 'userGuessed';
	payload: {
		username: string;
	};
}

export interface WSError extends WebSocketInputMessage {
	type: 'error';
	payload: {
		message: string;
	};
}

export interface RoundFinishedMessage extends WebSocketInputMessage {
	type: 'roundFinished';
	payload: {
		guesses: MultiplayerGuess[];
	};
}

export interface GameFinishedMessage extends WebSocketInputMessage {
	type: 'gameFinished';
}

export type MultiplayerInputMessage =
	| WSError
	| ConnectedUsersMessage
	| UserJoinMessage
	| UserLeftMessage
	| UserGuessedMessage
	| RoundFinishedMessage
	| GameFinishedMessage;

export interface UserGuessMessage extends WebSocketOutputMessage {
	type: 'userGuess';
	payload: {
		guess: LatLng;
	};
}

export interface RoundEndMessage extends WebSocketOutputMessage {
	type: 'endRound';
}

export type MultiplayerOutputMessage = RoundEndMessage | UserGuessMessage;
