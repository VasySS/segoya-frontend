import { error, redirect } from '@sveltejs/kit';
import { fetchBackend } from '$lib/api/base';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const jwtToken = event.locals.jwtToken;
	const jwtPayload = event.locals.jwtPayload;

	if (!jwtToken || !jwtPayload) {
		redirect(303, '/login?redirect-to=/lobbies');
	}

	const lobbiesResponse = await fetchBackend(jwtToken, 'get', '/v1/lobbies', {
		query: {
			page: 1,
			'page-size': 10
		}
	});

	if (!lobbiesResponse.success) {
		error(lobbiesResponse.error.status, lobbiesResponse.error.detail);
	}

	return {
		jwtToken,
		jwtPayload,
		lobbies: lobbiesResponse.data
	};
};
