import { error, type RequestEvent } from '@sveltejs/kit';
import { Polygon } from '#lib/api/openapi.js';
import { m } from '#paraglide/messages.js';
import { z } from 'zod';

import { isPayloadWithinLimit, polygonError } from './geometry';

export function actor(event: RequestEvent): string {
	if (!event.locals.jwtToken) error(401, m.areaDisconnected());
	return event.locals.jwtToken;
}

export function areaID(id: string): string {
	if (!z.uuid().safeParse(id).success) error(404, m.areaNone());
	return id;
}

export async function readAreaForm(request: Request) {
	const form = await request.formData();
	const stringField = (key: string, fallback = '') => {
		const value = form.get(key);
		return typeof value === 'string' ? value : fallback;
	};
	const values = {
		name: stringField('name').trim(),
		visibility: stringField('visibility', 'private'),
		polygonJSON: stringField('polygonJSON')
	};
	const schema = z.object({
		name: z.string().min(1).max(100),
		visibility: z.enum(['private', 'unlisted']),
		polygon: Polygon
	});
	let polygon: unknown;
	try {
		polygon = JSON.parse(values.polygonJSON) as unknown;
	} catch {
		polygon = undefined;
	}
	const result = schema.safeParse({ name: values.name, visibility: values.visibility, polygon });
	if (!result.success)
		return {
			values,
			error:
				!values.name || values.name.length > 100 ? m.areaNameInvalid() : m.areaCompleteSelection()
		};
	const geometryError = polygonError(result.data.polygon);
	if (geometryError) return { values, error: geometryError };
	return isPayloadWithinLimit(result.data)
		? { values, data: result.data }
		: { values, error: m.areaPayloadTooLarge() };
}
