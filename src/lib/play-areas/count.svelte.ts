import { fetchBackend } from '#lib/api/base.js';
import type { PlayAreaSelection, Provider } from '#lib/api/openapi.js';
import { m } from '#paraglide/messages.js';

import { areaSelectionSchema, isPayloadWithinLimit, selectionKey } from './geometry';

export class AreaCounter {
	#request = 0;
	#timer: ReturnType<typeof setTimeout> | undefined;
	#abort: AbortController | undefined;
	status = $state<'idle' | 'invalid' | 'checking' | 'ready' | 'failed'>('idle');
	count = $state<number>();
	error = $state('');
	key = $state('');

	async #load(
		jwt: string,
		provider: Provider,
		selection: PlayAreaSelection,
		request: number,
		signal: AbortSignal
	) {
		try {
			const response = await fetchBackend(
				jwt,
				'post',
				'/v1/play-areas/count',
				{ body: { provider, playArea: selection } },
				{ signal: AbortSignal.any([signal, AbortSignal.timeout(5000)]) }
			);

			if (signal.aborted || request !== this.#request) return;
			if (response.success) {
				this.count = response.data.locationCount;
				this.status = 'ready';
			} else {
				this.status = 'failed';
				this.error = response.error.detail;
			}
		} catch {
			if (signal.aborted || request !== this.#request) return;

			this.status = 'failed';
			this.error = m.areaRequestFailed();
		}
	}

	cancel() {
		this.#request++;
		clearTimeout(this.#timer);
		this.#abort?.abort();
	}

	schedule(jwt: string, provider: Provider, selection: PlayAreaSelection, delay = 400) {
		this.cancel();
		this.key = selectionKey(provider, selection);
		this.count = undefined;
		this.error = '';

		const parsed = areaSelectionSchema.safeParse(selection);
		if (!parsed.success || !isPayloadWithinLimit({ provider, playArea: selection })) {
			this.status = 'invalid';
			this.error = parsed.success ? m.areaPayloadTooLarge() : m.areaCompleteSelection();
			return;
		}

		this.status = 'checking';
		const request = this.#request;
		const abort = new AbortController();
		this.#abort = abort;
		this.#timer = setTimeout(() => {
			void this.#load(jwt, provider, parsed.data, request, abort.signal);
		}, delay);
	}
}
