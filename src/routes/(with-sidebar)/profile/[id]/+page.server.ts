import { error, redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { fetchBackend } from '$lib/api/base';
import { m } from '$paraglide/messages.js';
import { uuidv7 } from 'zod';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const jwtToken = event.locals.jwtToken;
	const jwtPayload = event.locals.jwtPayload;

	if (!jwtPayload || !jwtToken) {
		redirect(303, resolve('/(with-sidebar)/login'));
	}

	if (event.params.id === jwtPayload.userID) {
		redirect(303, resolve('/(with-sidebar)/profile'));
	}

	const uuidParsed = uuidv7().safeParse(event.params.id);
	if (!uuidParsed.success) {
		error(400, m.even_mushy_goldfish_inspire());
	}

	const userResponse = await fetchBackend(jwtToken, 'get', `/v1/users/{id}`, {
		path: { id: uuidParsed.data }
	});
	if (!userResponse.success) {
		error(userResponse.error.status, userResponse.error.detail);
	}

	return { user: userResponse.data };
};
