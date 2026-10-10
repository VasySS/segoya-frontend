<script lang="ts">
	import { isCaptchaEnabled } from '#lib/captcha/config.js';
	import { m } from '#paraglide/messages.js';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import * as Form from '#components/shadcn/form/index.js';
	import { Input } from '#components/shadcn/input/index.js';
	import ButtonLoading from '#components/shared/button-loading/button-loading.svelte';
	import Captcha from '#components/shared/captcha/Captcha.svelte';
	import PasswordInput from '#components/shared/HiddenInput.svelte';

	import DiscordOAuth from './(components)/DiscordButton.svelte';
	import YandexOAuth from './(components)/YandexButton.svelte';
	import { formSchema } from './schema';

	let { data } = $props();
	let captcha = $state<Captcha>();

	// svelte-ignore state_referenced_locally
	const form = superForm(data.form, {
		validators: zod4Client(formSchema),
		multipleSubmits: 'prevent',
		dataType: 'json',
		onResult: ({ result }) => {
			if (result.type === 'error') captcha?.reset();
		},
		onUpdate: ({ form }) => {
			form.data.captcha = '';
		},
		onUpdated: () => {
			captcha?.reset();
		}
	});
	const { form: formData, enhance, delayed } = form;

	$formData.redirectTo = page.url.searchParams.get('redirect-to') ?? '';
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

	<Form.Field
		{form}
		name="captcha"
	>
		<Captcha
			bind:this={captcha}
			bind:token={$formData.captcha}
		/>
		<Form.FieldErrors />
	</Form.Field>

	<ButtonLoading
		type="submit"
		{delayed}
		disabled={isCaptchaEnabled && !$formData.captcha}
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
		<!-- <DiscordOAuth /> -->
		<YandexOAuth />
	</div>
</form>

<!-- {#if browser}
	<SuperDebug data={$formData} />
{/if} -->
