import { fail, redirect } from '@sveltejs/kit';
import { fetchBackend } from '#lib/api/base.js';
import { isPayloadWithinLimit } from '#lib/play-areas/geometry.js';
import { preselectedArea } from '#lib/play-areas/server.js';
import { m } from '#paraglide/messages.js';
import { resolve } from '$app/paths';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import type { Actions, PageServerLoad } from './$types';
import { formSchema } from './schema';

export const load: PageServerLoad = async ({ url, locals }) => {
	return {
		form: await superValidate(
			{ playArea: await preselectedArea(url, locals.jwtToken ?? '') },
			zod4(formSchema)
		)
	};
};

export const actions: Actions = {
	default: async (event) => {
		const jwtToken = event.locals.jwtToken;

		if (!jwtToken) {
			redirect(303, resolve('/(with-sidebar)/login'));
		}

		const form = await superValidate(event, zod4(formSchema));
		if (!form.valid) return fail(400, { form });

		if (!isPayloadWithinLimit(form.data)) {
			return message(form, m.areaPayloadTooLarge(), { status: 400 });
		}

		const gameResponse = await fetchBackend(jwtToken, 'post', '/v1/singleplayer', {
			body: {
				movementAllowed: form.data.movementAllowed,
				rounds: form.data.rounds,
				provider: form.data.provider,
				playArea: form.data.playArea,
				...(form.data.timerEnabled && { timerSeconds: form.data.timerSeconds })
			}
		});

		if (!gameResponse.success) {
			return message(form, gameResponse.error.detail, { status: 400 });
		}

		redirect(303, resolve('/(game)/singleplayer/[id]', { id: gameResponse.data.id }));
	}
};
