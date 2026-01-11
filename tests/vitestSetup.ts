import '@testing-library/jest-dom/vitest';

import { render, type RenderOptions, type SvelteComponentOptions } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import type { Component } from 'svelte';
import { vi } from 'vitest';

vi.mock('svelte-sonner', () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn()
	}
}));

vi.mock('$app/forms', async () => {
	const actual = await vi.importActual('$app/forms');

	return {
		...actual,
		applyAction: vi.fn(),
		enhance: vi.fn().mockImplementation(() => {
			return {
				destroy: vi.fn()
			};
		})
	};
});

// Mock ResizeObserver for jsdom
globalThis.ResizeObserver = class ResizeObserver {
	constructor(cb: ResizeObserverCallback) {
		this.cb = cb;
	}
	cb: ResizeObserverCallback;
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	observe() {}
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	unobserve() {}
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	disconnect() {}
};

// Mock input files property for jsdom to make it writable
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
delete (HTMLInputElement.prototype as any).files;
/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
Object.defineProperty(HTMLInputElement.prototype, 'files', {
	get() {
		return this._files ?? [];
	},
	set(value) {
		this._files = value;
	},
	configurable: true
});

export function setupComponent(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	component: Component<any>,
	options = {} as SvelteComponentOptions<Component>,
	renderOptions = {} as RenderOptions
) {
	return {
		user: userEvent.setup(),
		...render(component, options, renderOptions)
	};
}
