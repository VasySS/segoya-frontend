import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	redirect(301, resolve('/(with-sidebar)/lobbies'));
};
