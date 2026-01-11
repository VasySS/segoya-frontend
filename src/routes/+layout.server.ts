import type { LayoutServerLoad } from './$types';

// pass info from locals to the `page` store
export const load: LayoutServerLoad = ({ locals }) => {
	return {
		jwtPayload: locals.jwtPayload,
		jwtToken: locals.jwtToken
	};
};
