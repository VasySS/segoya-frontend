import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { fetchBackend } from '$lib/api/base.js';
import { setAllCookiesFromHeader } from '$lib/utils/auth';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import type { Actions, PageServerLoad } from './$types.js';
import { formSchema } from './schema.js';

export const load: PageServerLoad = async (event) => {
	if (event.locals.jwtPayload) {
		redirect(303, resolve('/(with-sidebar)/profile'));
	}

	return {
		form: await superValidate(zod4(formSchema))
	};
};

export const actions: Actions = {
	default_auth: async (event) => {
		const form = await superValidate(event, zod4(formSchema));

		const loginResponse = await fetchBackend('', 'post', '/v1/auth/login', {
			header: {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				'User-Agent': event.request.headers.get('user-agent')!,
				'Frontend-Captcha-Token': form.data.captcha
			},
			body: {
				username: form.data.login,
				password: form.data.password
			}
		});

		if (!loginResponse.success) {
			return setError(form, 'password', loginResponse.error.detail);
		}

		setAllCookiesFromHeader(event, loginResponse.headers['Set-Cookie']);

		const redirectTo = form.data.redirectTo;
		if (redirectTo && redirectTo !== '/login') {
			redirect(303, `/${redirectTo.slice(1)}`);
		}

		redirect(303, resolve('/(with-sidebar)/profile'));
	}
};
