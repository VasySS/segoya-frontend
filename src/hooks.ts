import type { Reroute } from '@sveltejs/kit/hooks';
import { deLocalizeUrl } from '#paraglide/runtime.js';
import z from 'zod';

// eslint-disable-next-line unicorn/no-top-level-side-effects
z.config({ jitless: true }); // does not work with CSP

export const reroute: Reroute = (request) => {
	return deLocalizeUrl(request.url).pathname;
};
