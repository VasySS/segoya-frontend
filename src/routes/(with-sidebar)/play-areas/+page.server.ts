import { error } from '@sveltejs/kit';
import { fetchBackend } from '#lib/api/base.js';
import { actor } from '#lib/play-areas/saved.server.js';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const requestedPage = Number(event.url.searchParams.get('page')) || 1;
	const page = Math.max(1, Math.floor(requestedPage));
	const response = await fetchBackend(actor(event), 'get', '/v1/play-areas', {
		query: { page, 'page-size': 10 }
	});
	if (!response.success) error(response.error.status, response.error.detail);

	return { areas: response.data.areas, total: response.data.total, page };
};
