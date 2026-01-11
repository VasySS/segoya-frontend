import { redirect, type Actions } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { fetchBackend } from '$lib/api/base';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import type { PageServerLoad } from './$types';
import { formSchema } from './schema';

export const load: PageServerLoad = async (event) => {
	if (event.locals.jwtPayload) {
		redirect(303, resolve('/(with-sidebar)/profile'));
	}

	return {
		form: await superValidate(zod4(formSchema))
	};
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod4(formSchema));

		const response = await fetchBackend('', 'post', '/v1/auth/register', {
			header: {
				'Frontend-Captcha-Token': form.data.captcha
			},
			body: {
				username: form.data.login,
				password: form.data.password,
				name: form.data.name
			}
		});

		if (!response.success) {
			return setError(form, 'login', response.error.detail);
		}

		redirect(303, resolve('/(with-sidebar)/login'));
	}
};
