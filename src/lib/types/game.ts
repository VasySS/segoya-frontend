import type { MultiplayerGame } from '#lib/api/openapi.js';

import type { MultiplayerUser } from './user';

export interface MultiplayerGameInfo extends MultiplayerGame {
	usersInfo: MultiplayerUser[];
}
