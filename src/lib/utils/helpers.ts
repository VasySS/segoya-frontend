import { shapes } from '@dicebear/collection';
import { createAvatar } from '@dicebear/core';
import { AVATARS_BASE_URL } from '$lib/api/base';

export function getAvatarSource(avatarHash: string, username: string): string {
	if (avatarHash) {
		return `${AVATARS_BASE_URL}/${avatarHash}`;
	}

	return createAvatar(shapes, {
		seed: username,
		backgroundColor: ['63e46e', '33afd5', 'd85e92', 'fdd6b5', '904e32']
	}).toDataUri();
}
