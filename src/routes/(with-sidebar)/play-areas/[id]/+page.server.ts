import { error, fail, redirect } from '@sveltejs/kit';
import { fetchBackend } from '#lib/api/base.js';
import { actor, areaID, readAreaForm } from '#lib/play-areas/saved.server.js';
import { m } from '#paraglide/messages.js';
import { resolve } from '$app/paths';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const response = await fetchBackend(actor(event), 'get', '/v1/play-areas/{id}', {
		path: { id: areaID(event.params.id) }
	});
	if (!response.success) {
		error(
			response.error.status,
			response.error.status === 404 ? m.areaNone() : response.error.detail
		);
	}

	return {
		area: response.data,
		isOwner: response.data.ownerID === event.locals.jwtPayload?.userID
	};
};

export const actions: Actions = {
	save: async (event) => {
		const jwt = actor(event),
			id = areaID(event.params.id);

		const input = await readAreaForm(event.request);
		if (!input.data) return fail(400, { error: input.error });

		const response = await fetchBackend(jwt, 'patch', '/v1/play-areas/{id}', {
			path: { id },
			body: input.data
		});
		if (!response.success) return fail(400, { error: response.error.detail });

		redirect(303, resolve('/(with-sidebar)/play-areas/[id]', { id }));
	},
	share: async (event) => {
		const response = await fetchBackend(actor(event), 'patch', '/v1/play-areas/{id}', {
			path: { id: areaID(event.params.id) },
			body: { visibility: 'unlisted' }
		});

		return response.success ? { linkReady: true } : fail(400, { error: response.error.detail });
	},
	delete: async (event) => {
		const response = await fetchBackend(actor(event), 'delete', '/v1/play-areas/{id}', {
			path: { id: areaID(event.params.id) }
		});
		if (!response.success) return fail(400, { error: response.error.detail });

		redirect(303, resolve('/(with-sidebar)/play-areas'));
	}
};
