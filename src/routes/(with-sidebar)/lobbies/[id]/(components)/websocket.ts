import type {
	WebSocketInputMessage,
	WebSocketOutputMessage,
	WSError
} from '$components/shared/websocket/types';
import type { Provider, UserPublicProfile } from '$lib/api/openapi';

export interface ConnectedUsersMessage extends WebSocketInputMessage {
	type: 'connectedUsers';
	payload: {
		users: UserPublicProfile[];
	};
}

export interface UserConnectedMessage extends WebSocketInputMessage {
	type: 'userConnected';
	payload: {
		user: UserPublicProfile;
	};
}

export interface UserDisconnectedMessage extends WebSocketInputMessage {
	type: 'userDisconnected';
	payload: {
		username: string;
	};
}

export interface GameRedirectMessage extends WebSocketInputMessage {
	type: 'gameRedirect';
	payload: {
		gameID: string;
	};
}

export interface ChatMessageContent {
	time: string;
	username: string;
	text: string;
}

export interface ChatMessageFromBackend extends WebSocketInputMessage {
	type: 'chatOutput';
	payload: {
		message: ChatMessageContent;
	};
}

export interface LobbySettingsContent {
	provider: Provider;
	movementAllowed: boolean;
	rounds: number;
	timerSeconds: number;
}

export interface LobbySettingsChangedMessage extends WebSocketInputMessage {
	type: 'settingsChanged';
	payload: {
		settings: LobbySettingsContent;
	};
}

export type LobbyInputMessage =
	| WSError
	| ConnectedUsersMessage
	| UserConnectedMessage
	| UserDisconnectedMessage
	| GameRedirectMessage
	| ChatMessageFromBackend
	| LobbySettingsChangedMessage;

////////////////////////////////////////
////////////////////////////////////////
////////////////////////////////////////

export interface ChatMessageToBackend extends WebSocketOutputMessage {
	type: 'chatInput';
	payload: {
		message: ChatMessageContent;
	};
}

export interface GameStartMessage extends WebSocketOutputMessage {
	type: 'gameStart';
}

export interface LobbyNewSettingsMessage extends WebSocketOutputMessage {
	type: 'settingsNew';
	payload: {
		settings: LobbySettingsContent;
	};
}

export type LobbyOutputMessage = ChatMessageToBackend | GameStartMessage | LobbyNewSettingsMessage;
