import { BACKEND_BASE_WS_URL } from './base';

export const multiplayerBaseURL = 'multiplayer';
export const lobbiesBaseURL = 'lobbies';

export function getMultiplayerWebSocketURL(id: string, jwt: string) {
	return `${BACKEND_BASE_WS_URL}/v1/${multiplayerBaseURL}/${id}/ws?token=${jwt}`;
}

export function getLobbyWebSocketURL(id: string, jwt: string) {
	return `${BACKEND_BASE_WS_URL}/v1/${lobbiesBaseURL}/${id}/ws?token=${jwt}`;
}
