import { error } from '@sveltejs/kit';
import { fetchBackend } from '#lib/api/base.js';
import type { PlayAreaSelection } from '#lib/api/openapi.js';
import { m } from '#paraglide/messages.js';
import { z } from 'zod';

export async function preselectedArea(url: URL, jwt: string): Promise<PlayAreaSelection> {
	const id = url.searchParams.get('area');
	if (!id) return { type: 'all' };
	if (!z.uuid().safeParse(id).success) error(404, m.areaNone());

	const response = await fetchBackend(jwt, 'get', '/v1/play-areas/{id}', { path: { id } });
	if (!response.success) {
		error(
			response.error.status,
			response.error.status === 404 ? m.areaNone() : response.error.detail
		);
	}

	return { type: 'saved', savedID: response.data.id };
}
