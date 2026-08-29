import type { Reroute } from '@sveltejs/kit/hooks';
import { deLocalizeUrl } from '$paraglide/runtime.js';

export const reroute: Reroute = (request) => {
	return deLocalizeUrl(request.url).pathname;
};
