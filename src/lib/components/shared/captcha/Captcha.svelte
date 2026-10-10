<script lang="ts">
	import { captchaConfig, isCaptchaEnabled } from '#lib/captcha/config.js';
	import { captchaAdapters } from '#lib/captcha/providers.js';
	import type { CaptchaWidget } from '#lib/captcha/types.js';
	import { m } from '#paraglide/messages.js';
	import { getLocale } from '#paraglide/runtime.js';
	import { onMount } from 'svelte';
	import { Button } from '#components/shadcn/button/index.js';

	// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-useless-assignment -- Parent bindings observe writes to this prop.
	let { token = $bindable('') }: { token?: string } = $props();
	let container = $state<HTMLDivElement>();
	let isFailed = $state(false);
	let isLoading = $state(true);
	let widget: CaptchaWidget | undefined;
	let isMounted = false;
	let attempt = 0;
	const adapter = captchaAdapters[captchaConfig.provider];

	function showError() {
		token = '';
		isFailed = true;
		isLoading = false;
	}

	async function initialize() {
		const currentAttempt = ++attempt;
		widget?.destroy();
		widget = undefined;
		token = '';
		isFailed = false;
		isLoading = true;

		try {
			await adapter.load();
			if (!isMounted || !container || currentAttempt !== attempt) return;
			widget = adapter.render(container, {
				siteKey: captchaConfig.siteKey,
				locale: getLocale(),
				onToken: (value) => {
					if (!isMounted || currentAttempt !== attempt) return;
					token = value;
					isFailed = false;
				},
				onError: () => {
					if (isMounted && currentAttempt === attempt) showError();
				}
			});
			isLoading = false;
		} catch {
			if (isMounted && currentAttempt === attempt) showError();
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
		isMounted = true;
		if (isCaptchaEnabled) void initialize();
		return () => {
			isMounted = false;
			attempt++;
			widget?.destroy();
		};
	});
</script>

{#if isCaptchaEnabled}
	<div>
		<div
			bind:this={container}
			style:min-height="{adapter.height}px"
			aria-label={m.captchaLabel()}
			aria-busy={isLoading}
		></div>
		{#if isFailed}
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
