import { paraglideVitePlugin } from '@inlang/paraglide-js';
import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';

import packageJson from './package.json' with { type: 'json' };

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');

	return {
		plugins: [
			paraglideVitePlugin({
				project: './src/lib/i18n/project.inlang',
				outdir: './src/lib/i18n/paraglide',
				strategy: ['cookie', 'globalVariable', 'preferredLanguage', 'baseLocale']
			}),
			tailwindcss(),
			sveltekit({
				adapter: adapter(),
				version: { name: packageJson.version },
				...(env.ORIGIN && {
					paths: {
						origin: env.ORIGIN
					}
				})
			})
		],
		server: {
			warmup: {
				clientFiles: ['./src/hooks.ts', './src/app.css', './src/lib/utils/shadcn.ts'],
				ssrFiles: ['./src/hooks.server.ts']
			}
		},
		build: {
			rolldownOptions: {
				experimental: {
					lazyBarrel: true
				}
			}
		}
	};
});
