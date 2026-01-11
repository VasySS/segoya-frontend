import type { UserPublicProfile } from '$lib/api/openapi';

export interface MultiplayerUser extends UserPublicProfile {
	guessed: boolean;
	connected: boolean;
	score: number;
}

export interface UserSettings {
	minimapProvider: string;
	compassEnabled: boolean;
	sounds: {
		enabled: boolean;
		// from 0.0 to 1.0, to use in HTMLMediaElement
		volume: number;
	};
}

export interface UserAPIKeys {
	yandex: string;
	google: string;
	seznam: string;
}
