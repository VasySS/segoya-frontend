import { error, redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { fetchBackend } from '$lib/api/base';
import { m } from '$paraglide/messages.js';
import { uuidv7 } from 'zod';

import type { PageServerLoad } from './$types';

// SSR disabled for leaflet and panoramas to work correctly
export const ssr = false;

export const load: PageServerLoad = async (event) => {
	const jwtToken = event.locals.jwtToken;
	const jwtPayload = event.locals.jwtPayload;

	if (!jwtToken || !jwtPayload) {
		redirect(303, resolve('/(with-sidebar)/login'));
	}

	const uuidParsed = uuidv7().safeParse(event.params.id);
	if (!uuidParsed.success) {
		error(400, m.new_careful_elk_tend());
	}

	const [gameResponse, roundResponse, userResponse] = await Promise.all([
		fetchBackend(jwtToken, 'get', '/v1/singleplayer/{id}', { path: { id: uuidParsed.data } }),
		fetchBackend(jwtToken, 'get', `/v1/singleplayer/{id}/round`, { path: { id: uuidParsed.data } }),
		fetchBackend(jwtToken, 'get', `/v1/users/{id}`, { path: { id: jwtPayload.userID } })
	]);

	if (!gameResponse.success) {
		error(gameResponse.error.status, gameResponse.error.detail);
	}

	if (!roundResponse.success) {
		error(roundResponse.error.status, roundResponse.error.detail);
	}

	if (!userResponse.success) {
		error(userResponse.error.status, userResponse.error.detail);
	}

	return { game: gameResponse.data, round: roundResponse.data, user: userResponse.data };
};
