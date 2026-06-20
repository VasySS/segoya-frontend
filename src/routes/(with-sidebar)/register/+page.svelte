<script lang="ts">
	// import { browser } from '$app/environment';
	import { resolve } from '$app/paths';
	import * as Form from '$components/shadcn/form/index';
	import Input from '$components/shadcn/input/input.svelte';
	import ButtonLoading from '$components/shared/button-loading/button-loading.svelte';
	import PasswordInput from '$components/shared/HiddenInput.svelte';
	import { TURNSTILE_SITE_KEY } from '$lib/api/base.js';
	import { m } from '$paraglide/messages.js';
	import { onMount } from 'svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';

	import { formSchema } from './schema.js';

	let { data } = $props();

	// svelte-ignore state_referenced_locally
	const form = superForm(data.form, {
		validators: zod4Client(formSchema),
		multipleSubmits: 'prevent',
		dataType: 'json'
	});
	const { form: formData, enhance, delayed } = form;

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

		// script is created like this instead of 'svelte:head' to correctly load on redirects
		const script = document.createElement('script');
		script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
		script.addEventListener('load', turnstileOnLoad);

		document.head.append(script);
	});
</script>

<svelte:head>
	<title>Segoya &mdash; {m.registrationHeader()}</title>
</svelte:head>

<h1 class="mb-12 text-center">{m.registrationHeader()}</h1>

<form
	class="flex w-80 flex-col space-y-2 self-center"
	method="POST"
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
					autocapitalize="none"
					autocorrect="off"
					autocomplete="username"
					placeholder={m.loginUsername()}
					required
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
					placeholder={m.happy_witty_squirrel_care()}
					formProps={props}
				></PasswordInput>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field
		{form}
		name="passwordAgain"
	>
		<Form.Control>
			{#snippet children({ props })}
				<PasswordInput
					id="passwordAgain"
					bind:inputValue={$formData.passwordAgain}
					placeholder={m.royal_house_mare_dash()}
					formProps={props}
				></PasswordInput>
			{/snippet}
		</Form.Control>

		<Form.FieldErrors />
	</Form.Field>

	<Form.Field
		{form}
		name="name"
	>
		<Form.Control>
			{#snippet children({ props })}
				<Input
					{...props}
					bind:value={$formData.name}
					autocomplete="name"
					autocapitalize="words"
					autocorrect="on"
					type="text"
					placeholder={m.registerName()}
				/>
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
		{m.registerCreate()}
	</ButtonLoading>
</form>

<a
	class="mt-4 self-center hover:underline"
	href={resolve('/(with-sidebar)/login')}
>
	{m.registerLogin()}
</a>

<!-- {#if browser}
	<SuperDebug data={$formData} />
{/if} -->
