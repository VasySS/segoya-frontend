import { error, redirect } from '@sveltejs/kit';
import { fetchBackend } from '$lib/api/base';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import type { PageServerLoad } from './$types';
import { formSchema } from './settingsSchema';

export const load: PageServerLoad = async (event) => {
	const jwtToken = event.locals.jwtToken;
	const jwtPayload = event.locals.jwtPayload;

	if (!jwtToken || !jwtPayload) {
		redirect(303, '/login?redirect-to=/lobbies');
	}

	const lobbyResponse = await fetchBackend(jwtToken, 'get', '/v1/lobbies/{id}', {
		path: { id: event.params.id }
	});

	if (!lobbyResponse.success) {
		error(lobbyResponse.error.status, lobbyResponse.error.detail);
	}

	return {
		jwtToken,
		jwtPayload,
		lobby: lobbyResponse.data,
		form: await superValidate(zod4(formSchema))
	};
};
