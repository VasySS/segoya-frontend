import js from '@eslint/js';
import vitestPlugin from '@vitest/eslint-plugin';
import { importX } from 'eslint-plugin-import-x';
import playwright from 'eslint-plugin-playwright';
import svelte from 'eslint-plugin-svelte';
import testingLibrary from 'eslint-plugin-testing-library';
import unicorn from 'eslint-plugin-unicorn';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import svelteParser from 'svelte-eslint-parser';
import ts from 'typescript-eslint';

import viteConfig from './vite.config.js';

const extraFileExtensions = ['.svelte'];

export default defineConfig([
	globalIgnores([
		'node_modules/*',
		'.pnpm-store/**',
		'build/*',
		'coverage/*',
		'.svelte-kit/*',
		'package/*',
		'.unlighthouse',
		'**/*.lock',
		'**/.env*',
		'src/lib/{i18n,components/shadcn}',
		'src/paraglide',
		'src/lib/api/openapi.ts',
		'./eslint.config.ts',
		'./playwright.config.ts',
		'./vite.config.ts',
		'./vitest.config.ts',
		'playwright-report/*'
	]),

	// global rules
	js.configs.recommended,

	...ts.configs.strictTypeChecked,
	...ts.configs.stylisticTypeChecked,

	...svelte.configs.recommended,

	importX.flatConfigs.recommended,
	{
		...importX.flatConfigs.typescript,
		settings: {
			...importX.flatConfigs.typescript.settings,
			// Replace the preset's TypeScript resolver before ESLint merges settings.
			'import-x/resolver': {
				node: {
					extensions: ['.js', '.ts', '.json']
				},
				vite: {
					viteConfig
				}
			}
		}
	},
	unicorn.configs.recommended,

	// global language options
	{
		settings: {
			'import-x/parsers': {
				'@typescript-eslint/parser': ['.js', '.mjs', '.cjs', '.ts', '.tsx'],
				'svelte-eslint-parser': ['.svelte']
			},
			'import-x/external-module-folders': ['node_modules', '.pnpm']
		},
		languageOptions: {
			ecmaVersion: 'latest',
			parser: ts.parser,
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
				extraFileExtensions
			},
			globals: {
				...globals.browser,
				...globals.node,
				__VER__: 'readonly',
				google: 'readonly',
				ymaps: 'readonly',
				Panorama: 'readonly',
				L: 'readonly',
				turnstile: 'readonly'
			}
		}
	},
	// svelte rules
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parser: svelteParser,
			parserOptions: {
				parser: ts.parser,
				extraFileExtensions
			}
		},
		rules: {
			// False positives in svelte files
			'@typescript-eslint/no-unsafe-call': 'off',
			'@typescript-eslint/no-unsafe-member-access': 'off',
			'@typescript-eslint/no-unsafe-assignment': 'off'
		}
	},
	{
		files: ['**/*.svelte'],
		rules: {
			// Instance-script variables belong to each component, not the module.
			'unicorn/no-top-level-assignment-in-function': 'off'
		}
	},
	{
		files: ['src/**/*.{ts,svelte}'],
		rules: { '@typescript-eslint/no-deprecated': 'error' }
	},
	// SvelteKit compiles the service worker in its own Web Worker context and
	// intentionally excludes it from the application TypeScript project.
	{
		files: ['src/service-worker/**/*.ts'],
		extends: [ts.configs.disableTypeChecked]
	},
	// rules for unit tests (testing-library + vitest)
	{
		files: ['src/**/?(*.)+(spec|test).[jt]s?(x)'],
		extends: [testingLibrary.configs['flat/svelte']],
		plugins: {
			vitest: vitestPlugin
		},
		rules: {
			...vitestPlugin.configs.all.rules,
			// https://github.com/typescript-eslint/typescript-eslint/issues/522
			'@typescript-eslint/unbound-method': 'off',
			'vitest/max-expects': [
				'error',
				{
					max: 10
				}
			]
		}
	},
	{
		files: ['tests/e2e/**'],
		extends: [playwright.configs['flat/recommended']]
	},
	// global rules  overrides
	{
		rules: {
			'no-console': 'warn',
			'no-unused-vars': 'off',

			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					args: 'all',
					argsIgnorePattern: '^_',
					caughtErrors: 'all',
					caughtErrorsIgnorePattern: '^_',
					destructuredArrayIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					ignoreRestSiblings: true
				}
			],

			'unicorn/name-replacements': 'off',
			'unicorn/filename-case': 'off',
			'import-x/default': 'off',
			'import-x/namespace': 'off',
			'import-x/no-named-as-default': 'off',
			'import-x/no-named-as-default-member': 'off',
			'import-x/no-unresolved': 'off',

			'unicorn/no-incorrect-template-string-interpolation': 'off',
			'unicorn/prefer-await': 'off'
		}
	}
]);
