import { error, fail, redirect, type Actions } from '@sveltejs/kit';
import { accessCookieName, newDiscordOAuth, newYandexOAuth } from '#lib/api/auth.js';
import { fetchBackend } from '#lib/api/base.js';
import { getErrorFromResponse } from '#lib/api/errorHandling.js';
import { updateUserAvatar } from '#lib/api/users.js';
import { APIKeys } from '#lib/constants/enums.js';
import type { UserAPIKeys } from '#lib/types/user.js';
import { clearAuthCookies, setAllCookiesFromHeader } from '#lib/utils/auth.js';
import { resolve } from '$app/paths';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import { avatarSchema, formSchema } from './(components)/(account-tab)/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const jwtToken = event.locals.jwtToken;
	const jwtPayload = event.locals.jwtPayload;

	if (!jwtPayload || !jwtToken) {
		redirect(303, resolve('/(with-sidebar)/login'));
	}

	const profileResponse = await fetchBackend(jwtToken, 'get', '/v1/users/me');
	const sessionsResponse = await fetchBackend(jwtToken, 'get', '/v1/auth/sessions');
	const oauthProvidersResponse = await fetchBackend(jwtToken, 'get', '/v1/auth/providers');

	if (!profileResponse.success) {
		error(profileResponse.error.status, profileResponse.error.detail);
	}

	if (!sessionsResponse.success) {
		error(sessionsResponse.error.status, sessionsResponse.error.detail);
	}

	if (!oauthProvidersResponse.success) {
		error(oauthProvidersResponse.error.status, oauthProvidersResponse.error.detail);
	}

	const apiKeys = {
		yandex: event.cookies.get(APIKeys.YANDEX),
		google: event.cookies.get(APIKeys.GOOGLE),
		seznam: event.cookies.get(APIKeys.SEZNAM)
	} as UserAPIKeys;

	return {
		jwtToken,
		jwtPayload,
		apiKeys,
		profileInfo: profileResponse.data,
		sessions: sessionsResponse.data,
		connectedOAuth: oauthProvidersResponse.data,
		form: await superValidate(zod4(formSchema)),
		avatarForm: await superValidate(zod4(avatarSchema))
	};
};

export const actions: Actions = {
	logout: ({ cookies }) => {
		clearAuthCookies(cookies);

		redirect(303, resolve('/(with-sidebar)/login'));
	},

	update: async (event) => {
		if (!event.locals.jwtToken) return;

		const form = await superValidate(event, zod4(formSchema));
		if (!form.valid) return fail(400, { form });

		const response = await fetchBackend(event.locals.jwtToken, 'patch', '/v1/users/me', {
			body: {
				name: form.data.name
			}
		});

		if (!response.success) {
			return setError(form, 'name', response.error.detail);
		}

		redirect(303, resolve('/(with-sidebar)/profile'));
	},

	update_avatar: async (event) => {
		if (!event.locals.jwtToken) return;

		const form = await superValidate(event, zod4(avatarSchema));
		if (!form.valid) return fail(400, { form });

		const avatarBuffer = await form.data.userAvatar.arrayBuffer();
		const fd = new FormData();
		fd.append('avatarFile', new Blob([avatarBuffer], { type: form.data.userAvatar.type }));

		const response = await updateUserAvatar(event.locals.jwtToken, fd);
		if (!response.ok) {
			const err = await getErrorFromResponse(response);
			return setError(form, 'userAvatar', err.detail);
		}

		redirect(303, resolve('/(with-sidebar)/profile'));
	},

	add_yandex: async (event) => {
		const cookieToken = event.cookies.get(accessCookieName);
		if (!cookieToken) return;

		let redirectURL = resolve('/(with-sidebar)/profile') as string;

		try {
			const response = await newYandexOAuth(cookieToken);
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			setAllCookiesFromHeader(event, response.headers.get('set-cookie')!);

			const locationHeader = response.headers.get('Location');
			if (!locationHeader) return;

			redirectURL = locationHeader;
		} catch {
			return;
		}

		redirect(303, redirectURL, { external: true });
	},

	add_discord: async (event) => {
		const cookieToken = event.cookies.get(accessCookieName);
		if (!cookieToken) return;

		let redirectURL = resolve('/(with-sidebar)/profile') as string;

		try {
			const response = await newDiscordOAuth(cookieToken);
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			setAllCookiesFromHeader(event, response.headers.get('set-cookie')!);

			const locationHeader = response.headers.get('Location');
			if (!locationHeader) return;

			redirectURL = locationHeader;
		} catch {
			return;
		}

		redirect(303, redirectURL, { external: true });
	}
};
