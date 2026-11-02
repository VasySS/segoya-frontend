import { AVATARS_BASE_URL } from '#lib/api/base.js';
import { resolve } from '$app/paths';

export function getAvatarSource(avatarHash: string, username: string): string {
	return avatarHash
		? `${AVATARS_BASE_URL}/${avatarHash}`
		: `${resolve('/api/avatars/fallback.svg')}?${new URLSearchParams({ seed: username })}`;
}
