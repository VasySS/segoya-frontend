import { z, type ZodLiteral, type ZodNever, type ZodObject } from 'zod';

import { BackendError, EndpointByMethod } from './openapi';

export const FRONTEND_DOMAIN = import.meta.env.VITE_FRONTEND_DOMAIN;

export const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
export const BACKEND_BASE_WS_URL = import.meta.env.VITE_BACKEND_BASE_WS_URL;

export const YANDEX_API_KEY = import.meta.env.VITE_YANDEX_PANO_API_KEY;
export const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_PANO_API_KEY;
export const SEZNAM_API_KEY = import.meta.env.VITE_SEZNAM_PANO_API_KEY;

export const AVATARS_BASE_URL = import.meta.env.VITE_AVATARS_BASE_URL;
export const STATIC_BASE_URL = import.meta.env.VITE_STATIC_BASE_URL;
export const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

interface EndpointParameters {
	body?: unknown;
	query?: Record<string, unknown>;
	header?: Record<string, unknown>;
	path?: Record<string, unknown>;
}

function replacePlaceholders(text: string, values: Record<string, unknown>): string {
	return text.replaceAll(/{(\w+)}/g, (_, key) => {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		return String(values[key]) || '';
	});
}

function resolveUrl(path: string, params: EndpointParameters | undefined) {
	const url = `${BACKEND_BASE_URL}${path}`;

	if (!params) {
		return url;
	}

	const resolvedUrl = params.path === undefined ? url : replacePlaceholders(url, params.path);

	if (!('query' in params)) {
		return resolvedUrl;
	}

	const searchParams = new URLSearchParams(params.query as Record<string, string>);
	return `${resolvedUrl}?${searchParams.toString()}`;
}

function capitalizeHeaderName(name: string): string {
	return name
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join('-');
}

type BackendResult<T, H> =
	| { success: true; data: T; headers: H }
	| { success: false; error: BackendError };

// based of this file
// https://github.com/nilshartmann/end-to-end-typesafety-spring-boot-typescript/blob/main/frontend/src/fetch-from-api.ts
export async function fetchBackend<
	Method extends keyof EndpointByMethod,
	Path extends keyof EndpointByMethod[Method],
	Endpoint extends EndpointByMethod[Method][Path],
	ResponseData = Endpoint extends { responses: infer R }
		? Exclude<z.infer<R>[keyof z.infer<R>], BackendError>
		: never,
	ResponseHeaders = Endpoint extends { responseHeaders: infer RH }
		? Exclude<z.infer<RH>[keyof z.infer<RH>], BackendError>
		: never
>(
	jwt: string,
	method: Method,
	path: Path,
	params?: z.infer<Endpoint extends { parameters: infer P } ? P : never>
): Promise<BackendResult<ResponseData, ResponseHeaders>> {
	const endpoint = EndpointByMethod[method][path] as {
		method: ZodLiteral<Method>;
		path: ZodLiteral;
		parameters: ZodObject | ZodNever;
		responses: z.ZodObject<Record<string, z.ZodType>>;
		responseHeaders?: z.ZodObject<Record<string, z.ZodType>>;
	};

	// make sure given params match expectations from backend
	const validatedParams = params ? endpoint.parameters.parse(params) : undefined;
	// replace variables and add URL search params
	const url = resolveUrl(path.toString(), validatedParams);

	const requestPayload =
		// eslint-disable-next-line unicorn/no-null -- null should be used for empty payloads in fetch
		validatedParams && 'body' in validatedParams ? JSON.stringify(validatedParams.body) : null;

	const requestHeaders =
		validatedParams && 'header' in validatedParams
			? (validatedParams.header as Record<string, string>)
			: // eslint-disable-next-line unicorn/no-null
				null;

	try {
		const response = await fetch(url, {
			method: method,
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${jwt}`,
				...requestHeaders
			},
			body: requestPayload
		});

		const statusStr = response.status.toString();
		const responseSchema = endpoint.responses.shape[statusStr];
		if (!responseSchema) {
			throw new Error(`Unexpected status code: ${String(response.status)}`);
		}

		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const responseJSON = responseSchema instanceof z.ZodUnknown ? '' : await response.json();

		if (!response.ok) {
			const backendError = responseSchema.parse(responseJSON) as BackendError;
			return {
				success: false,
				error: backendError
			};
		}

		const headersSchema = endpoint.responseHeaders?.shape[statusStr];
		const headers = headersSchema
			? headersSchema.parse(
					Object.fromEntries(
						response.headers.entries().map(([key, value]) => [capitalizeHeaderName(key), value])
					)
				)
			: undefined;

		// make sure response returned from server is valid according to schema
		return {
			success: true,
			data: responseSchema.parse(responseJSON) as ResponseData,
			headers: headers as ResponseHeaders
		};
	} catch (error) {
		if (error instanceof z.ZodError) {
			// handle the case when backend returns an error or default response, but it's not according to openapi schema
			// should not happen if openapi schema is in sync with backend and input params are valid
			return {
				success: false,
				error: {
					title: 'Request data validation failed',
					status: 500,
					detail: z.prettifyError(error)
				}
			};
		}

		if (error instanceof SyntaxError) {
			// handle the case when backend returns something that is not JSON
			return {
				success: false,
				error: {
					title: 'Response parsing failed',
					status: 500,
					detail: 'Server returned unexpected response'
				}
			};
		}

		if (error instanceof Error && error.message == 'fetch failed') {
			// handle the case when backend is down and fetch fails
			return {
				success: false,
				error: {
					title: 'Request failed',
					status: 503,
					detail: 'Unexpected error while fetching data'
				}
			};
		}

		// if none of the above cases happened, just throw
		throw error;
	}
}
