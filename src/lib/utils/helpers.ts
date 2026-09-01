import { Avatar, Style } from '@dicebear/core';
import definition from '@dicebear/styles/shapes.json' with { type: 'json' };
import { AVATARS_BASE_URL } from '#lib/api/base.js';

export function getAvatarSource(avatarHash: string, username: string): string {
	if (avatarHash) {
		return `${AVATARS_BASE_URL}/${avatarHash}`;
	}

	const style = new Style(definition);
	const avatar = new Avatar(style, {
		seed: username,
		backgroundColor: ['63e46e', '33afd5', 'd85e92', 'fdd6b5', '904e32']
	});

	return avatar.toDataUri();
}
