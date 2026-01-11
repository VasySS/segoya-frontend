import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { accessCookieName } from '$lib/api/auth';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = (event) => {
	if (event.cookies.get(accessCookieName)) {
		redirect(303, resolve('/(with-sidebar)/home'));
	}
};
