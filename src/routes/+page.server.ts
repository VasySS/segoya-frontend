import { redirect } from '@sveltejs/kit';
import { accessCookieName } from '#lib/api/auth.js';
import { resolve } from '$app/paths';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = (event) => {
	if (event.cookies.get(accessCookieName)) {
		redirect(303, resolve('/(with-sidebar)/home'));
	}
};
