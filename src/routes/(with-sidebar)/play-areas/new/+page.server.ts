import { fail, redirect } from '@sveltejs/kit';
import { fetchBackend } from '#lib/api/base.js';
import { actor, readAreaForm } from '#lib/play-areas/saved.server.js';
import { resolve } from '$app/paths';

import type { Actions } from './$types';

export const actions: Actions = {
	default: async (event) => {
		const jwt = actor(event);
		const input = await readAreaForm(event.request);
		if (!input.data) return fail(400, { error: input.error, values: input.values });

		const response = await fetchBackend(jwt, 'post', '/v1/play-areas', { body: input.data });
		if (!response.success) return fail(400, { error: response.error.detail, values: input.values });

		redirect(303, resolve('/(with-sidebar)/play-areas/[id]', { id: response.data.id }));
	}
};
