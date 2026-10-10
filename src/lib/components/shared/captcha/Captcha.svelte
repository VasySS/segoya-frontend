<script lang="ts">
	import { captchaConfig, captchaEnabled } from '#lib/captcha/config.js';
	import { captchaAdapters } from '#lib/captcha/providers.js';
	import type { CaptchaWidget } from '#lib/captcha/types.js';
	import { m } from '#paraglide/messages.js';
	import { getLocale } from '#paraglide/runtime.js';
	import { onMount } from 'svelte';
	import { Button } from '#components/shadcn/button/index.js';

	let { token = $bindable('') }: { token?: string } = $props();
	let container = $state<HTMLDivElement>();
	let failed = $state(false);
	let loading = $state(true);
	let widget: CaptchaWidget | undefined;
	let mounted = false;
	let attempt = 0;
	const adapter = captchaAdapters[captchaConfig.provider];

	function showError() {
		token = '';
		failed = true;
		loading = false;
	}

	async function initialize() {
		const currentAttempt = ++attempt;
		widget?.destroy();
		widget = undefined;
		token = '';
		failed = false;
		loading = true;

		try {
			await adapter.load();
			if (!mounted || !container || currentAttempt !== attempt) return;
			widget = adapter.render(container, {
				siteKey: captchaConfig.siteKey,
				locale: getLocale(),
				onToken: (value) => {
					if (!mounted || currentAttempt !== attempt) return;
					token = value;
					failed = false;
				},
				onError: () => {
					if (mounted && currentAttempt === attempt) showError();
				}
			});
			loading = false;
		} catch {
			if (mounted && currentAttempt === attempt) showError();
		}
	}

	export function reset() {
		token = '';
		try {
			widget?.reset();
		} catch {
			showError();
		}
	}

	onMount(() => {
		mounted = true;
		if (captchaEnabled) void initialize();
		return () => {
			mounted = false;
			attempt++;
			widget?.destroy();
		};
	});
</script>

{#if captchaEnabled}
	<div>
		<div
			bind:this={container}
			style:min-height="{adapter.height}px"
			aria-label={m.captchaLabel()}
			aria-busy={loading}
		></div>
		{#if failed}
			<p
				role="alert"
				class="text-destructive text-sm"
			>
				{m.captchaLoadError()}
			</p>
			<Button
				type="button"
				variant="outline"
				onclick={initialize}>{m.captchaRetry()}</Button
			>
		{/if}
	</div>
{/if}
