import { createHash } from 'node:crypto';
import { Avatar, Style } from '@dicebear/core';
import definition from '@dicebear/styles/shapes.json' with { type: 'json' };
import { error } from '@sveltejs/kit';

import type { RequestHandler } from './$types';

const style = new Style(definition);
const avatars = new Map<string, { svg: string; etag: string }>();
const maxCachedAvatars = 512;

export const GET: RequestHandler = ({ url, request }) => {
	const seed = url.searchParams.get('seed');
	if (seed === null || seed.length > 128) error(400, 'Invalid avatar seed');

	let avatar = avatars.get(seed);
	if (!avatar) {
		const svg = new Avatar(style, {
			seed,
			backgroundColor: ['63e46e', '33afd5', 'd85e92', 'fdd6b5', '904e32']
		}).toString();
		avatar = { svg, etag: `"${createHash('sha256').update(svg).digest('hex')}"` };
		if (avatars.size >= maxCachedAvatars) {
			const oldestSeed = avatars.keys().next().value;
			if (oldestSeed !== undefined) avatars.delete(oldestSeed);
		}
		avatars.set(seed, avatar);
	}

	const headers = {
		'Content-Type': 'image/svg+xml; charset=utf-8',
		'Cache-Control': 'public, max-age=86400',
		ETag: avatar.etag
	};
	const matches = request.headers
		.get('if-none-match')
		?.split(',')
		.map((tag) => tag.trim());
	return matches?.some((tag) => tag === '*' || tag.replace(/^W\//, '') === avatar.etag)
		? new Response(undefined, { status: 304, headers })
		: new Response(avatar.svg, { headers });
};
