<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import * as Form from '$components/shadcn/form/index';
	import { Input } from '$components/shadcn/input/index';
	import ButtonLoading from '$components/shared/button-loading/button-loading.svelte';
	import PasswordInput from '$components/shared/HiddenInput.svelte';
	import { TURNSTILE_SITE_KEY } from '$lib/api/base';
	import { m } from '$paraglide/messages.js';
	import { onMount } from 'svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';

	import DiscordOAuth from './(components)/DiscordButton.svelte';
	import YandexOAuth from './(components)/YandexButton.svelte';
	import { formSchema } from './schema';

	let { data } = $props();

	// svelte-ignore state_referenced_locally
	const form = superForm(data.form, {
		validators: zod4Client(formSchema),
		multipleSubmits: 'prevent',
		dataType: 'json'
	});
	const { form: formData, enhance, delayed } = form;

	$formData.redirectTo = page.url.searchParams.get('redirect-to') ?? '';

	function turnstileOnLoad() {
		turnstile.render('#cf-turnstile', {
			// sitekey: '1x00000000000000000000AA',
			size: 'flexible',
			sitekey: TURNSTILE_SITE_KEY,
			callback: function (token: string) {
				$formData.captcha = token;
			}
		});
	}

	onMount(() => {
		if (
			document.querySelector('script[src="https://challenges.cloudflare.com/turnstile/v0/api.js"]')
		) {
			return;
		}

		// script is created like this instead of svelte:head to correctly load on redirects
		const script = document.createElement('script');
		script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
		script.addEventListener('load', turnstileOnLoad);

		document.head.append(script);
	});
</script>

<svelte:head>
	<title>Segoya &mdash; {m.loginHeader()}</title>
</svelte:head>

<h1 class="mb-12 text-center">{m.loginHeader()}</h1>

<form
	method="POST"
	class="flex w-80 flex-col space-y-2 self-center"
	action="?/default_auth"
	use:enhance
>
	<Form.Field
		{form}
		name="login"
	>
		<Form.Control>
			{#snippet children({ props })}
				<Input
					{...props}
					bind:value={$formData.login}
					type="text"
					placeholder={m.loginUsername()}
					autofocus
				/>
			{/snippet}
		</Form.Control>

		<Form.FieldErrors />
	</Form.Field>

	<Form.Field
		{form}
		name="password"
	>
		<Form.Control>
			{#snippet children({ props })}
				<PasswordInput
					id="password"
					bind:inputValue={$formData.password}
					placeholder={m.loginPassword()}
					formProps={props}
				></PasswordInput>
			{/snippet}
		</Form.Control>

		<Form.FieldErrors />
	</Form.Field>

	<div
		id="cf-turnstile"
		class="h-20"
	></div>

	<ButtonLoading
		type="submit"
		{delayed}
	>
		{m.loginLogin()}
	</ButtonLoading>

	<a
		href={resolve('/(with-sidebar)/register')}
		class="self-center hover:underline"
	>
		{m.loginRegister()}
	</a>

	<hr class="mx-3 py-1" />

	<div class="space-y-2 self-center">
		<DiscordOAuth />
		<YandexOAuth />
	</div>
</form>

<!-- {#if browser}
	<SuperDebug data={$formData} />
{/if} -->
