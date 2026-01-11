import { MediaQuery } from 'svelte/reactivity';

const DEFAULT_MOBILE_BREAKPOINT = 768;

export class IsMobile extends MediaQuery {
	constructor(breakpoint: number = DEFAULT_MOBILE_BREAKPOINT) {
		// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
		super(`max-width: ${breakpoint - 1}px`);
	}
}
