<script lang="ts">
	import MainSettings from '$components/game/creation-settings/MainSettings.svelte';
	import ProviderSelect from '$components/game/creation-settings/ProviderSelect.svelte';
	import * as Card from '$components/shadcn/card/index';
	import * as Form from '$components/shadcn/form/index';
	import { Input } from '$components/shadcn/input/index';
	import { Switch } from '$components/shadcn/switch/index';
	import ButtonLoading from '$components/shared/button-loading/button-loading.svelte';
	import { m } from '$paraglide/messages.js';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';

	import { formSchema } from './schema';

	let { data } = $props();

	// svelte-ignore state_referenced_locally
	const form = superForm(data.form, {
		validators: zod4Client(formSchema),
		multipleSubmits: 'prevent',
		dataType: 'json'
	});
	const { form: formData, enhance, delayed } = form;
</script>

<svelte:head>
	<title>Segoya &mdash; {m.lobbyCreation()}</title>
</svelte:head>

<h1 class="mb-12 text-center">{m.lobbyCreation()}</h1>

<form
	method="post"
	use:enhance
>
	<Card.Root>
		<Card.Header>
			<Card.Title>{m.lobbySettings()}</Card.Title>
		</Card.Header>

		<Card.Content class="space-y-4">
			<ProviderSelect {form} />
			<MainSettings {form} />

			<Form.Field
				{form}
				name="maxPlayers"
			>
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>{m.playersMax()}</Form.Label>
						<Input
							{...props}
							bind:value={$formData.maxPlayers}
							type="number"
							class="w-20"
							min="2"
							max="10"
						/>
					{/snippet}
				</Form.Control>

				<Form.FieldErrors />
			</Form.Field>

			<Form.Field
				{form}
				name="private"
			>
				<Form.Control>
					{#snippet children({ props })}
						<div class="flex items-center space-x-4">
							<Form.Label>{m.gross_elegant_termite_prosper()}</Form.Label>
							<Switch
								{...props}
								bind:checked={$formData.private}
							/>
						</div>
					{/snippet}
				</Form.Control>

				<Form.FieldErrors />
			</Form.Field>
		</Card.Content>

		<Card.Footer>
			<ButtonLoading
				type="submit"
				class="w-36"
				{delayed}
			>
				{m.createLobby()}
			</ButtonLoading>
		</Card.Footer>
	</Card.Root>

	<!-- {#if browser}
		<SuperDebug data={$formData} />
	{/if} -->
</form>
