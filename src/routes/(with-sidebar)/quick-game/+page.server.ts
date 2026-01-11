import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { fetchBackend } from '$lib/api/base';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import type { Actions, PageServerLoad } from './$types';
import { formSchema } from './schema';

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod4(formSchema))
	};
};

export const actions: Actions = {
	default: async (event) => {
		const jwtToken = event.locals.jwtToken;

		if (!jwtToken) {
			redirect(303, resolve('/(with-sidebar)/login'));
		}

		const form = await superValidate(event, zod4(formSchema));
		const gameResponse = await fetchBackend(jwtToken, 'post', '/v1/singleplayer', {
			body: {
				movementAllowed: form.data.movementAllowed,
				rounds: form.data.rounds,
				provider: form.data.provider,
				...(form.data.timerEnabled && { timerSeconds: form.data.timerSeconds })
			}
		});

		if (!gameResponse.success) {
			return setError(form, 'provider', gameResponse.error.detail);
		}

		redirect(303, resolve('/(game)/singleplayer/[id]', { id: gameResponse.data.id }));
	}
};
