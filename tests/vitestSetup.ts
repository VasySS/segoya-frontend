/* eslint-disable unicorn/no-this-outside-of-class */
/* eslint-disable unicorn/no-global-object-property-assignment */
/* eslint-disable unicorn/no-top-level-side-effects */
import '@testing-library/jest-dom/vitest';

import { render, type RenderOptions, type SvelteComponentOptions } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import type { Component } from 'svelte';
import { vi } from 'vitest';

vi.mock('$app/env/public', () => ({
	VITE_FRONTEND_DOMAIN: 'localhost',
	VITE_BACKEND_BASE_URL: 'http://localhost:4174',
	VITE_BACKEND_BASE_WS_URL: 'ws://localhost:4174',
	VITE_YANDEX_PANO_API_KEY: '',
	VITE_GOOGLE_PANO_API_KEY: '',
	VITE_SEZNAM_PANO_API_KEY: '',
	VITE_AVATARS_BASE_URL: '',
	VITE_STATIC_BASE_URL: '',
	VITE_TURNSTILE_SITE_KEY: ''
}));

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
	cb: ResizeObserverCallback;

	constructor(cb: ResizeObserverCallback) {
		this.cb = cb;
	}
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
