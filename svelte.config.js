import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
export default {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		alias: {
			$paraglide: './src/lib/i18n/paraglide',
			$components: './src/lib/components',
			$routes: './src/routes',
			$tests: './tests'
		}
	}
};
