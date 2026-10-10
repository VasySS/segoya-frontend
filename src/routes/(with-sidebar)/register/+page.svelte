<script lang="ts">
	import { captchaEnabled } from '#lib/captcha/config.js';
	import { m } from '#paraglide/messages.js';
	import { resolve } from '$app/paths';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import * as Form from '#components/shadcn/form/index.js';
	import Input from '#components/shadcn/input/input.svelte';
	import ButtonLoading from '#components/shared/button-loading/button-loading.svelte';
	import Captcha from '#components/shared/captcha/Captcha.svelte';
	import PasswordInput from '#components/shared/HiddenInput.svelte';

	import { formSchema } from './schema.js';

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
		disabled={captchaEnabled && !$formData.captcha}
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
