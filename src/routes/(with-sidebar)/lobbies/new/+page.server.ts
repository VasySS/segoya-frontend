import { redirect, type Actions } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { fetchBackend } from '$lib/api/base';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import type { PageServerLoad } from './$types';
import { formSchema } from './schema';

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod4(formSchema))
	};
};

export const actions: Actions = {
	default: async (event) => {
		const jwtToken = event.locals.jwtToken;
		const jwtPayload = event.locals.jwtPayload;

		if (!jwtToken || !jwtPayload) {
			redirect(303, resolve('/(with-sidebar)/login'));
		}

		const form = await superValidate(event, zod4(formSchema));
		const creatorID = jwtPayload.userID;

		const lobbyResponse = await fetchBackend(jwtToken, 'post', '/v1/lobbies', {
			body: {
				creatorID: creatorID,
				maxPlayers: form.data.maxPlayers,
				provider: form.data.provider,
				movementAllowed: form.data.movementAllowed,
				rounds: form.data.rounds,
				private: form.data.private,
				...(form.data.timerEnabled && { timerSeconds: form.data.timerSeconds })
			}
		});

		if (!lobbyResponse.success) {
			return setError(form, 'provider', lobbyResponse.error.detail);
		}

		redirect(303, resolve('/(with-sidebar)/lobbies/[id]', { id: lobbyResponse.data.id }));
	}
};
