import type { RequestHandler } from './$types';

export interface RequestBody {
	value: string;
	options: CookieOptions;
}

export interface CookieOptions {
	path?: string;
	domain?: string;
	expires?: Date;
	httpOnly?: boolean;
	secure?: boolean;
	maxAge?: number;
	sameSite?: 'strict' | 'lax' | 'none';
}

export const POST: RequestHandler = async ({ request, params, cookies }) => {
	const requestParsed = (await request.json()) as RequestBody;

	cookies.set(params.name, requestParsed.value, {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		...requestParsed.options
	});

	return Response.json({ success: true });
};

export const DELETE: RequestHandler = ({ cookies, params }) => {
	cookies.delete(params.name, { path: '/' });
	return Response.json({ success: true });
};
