import { sveltekit } from '@sveltejs/kit/vite';
import { svelteTesting } from '@testing-library/svelte/vite';
import { defineConfig } from 'vitest/config';

const excludes = [
	'.svelte-kit/**',
	'build/**',
	'coverage/**',
	'**/node_modules/**',
	'src/lib/i18n/**',
	'tests/**',
	'tests-examples/**'
];

export default defineConfig({
	plugins: [sveltekit(), svelteTesting()],
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: ['./tests/vitestSetup.ts'],
		pool: 'threads',
		exclude: excludes,
		coverage: {
			reporter: ['text', 'json', 'html'],
			provider: 'v8',
			exclude: excludes
		}
	}
});
