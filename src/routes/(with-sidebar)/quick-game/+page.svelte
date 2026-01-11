<script lang="ts">
	import MainSettings from '$components/game/creation-settings/MainSettings.svelte';
	import ProviderSelect from '$components/game/creation-settings/ProviderSelect.svelte';
	import * as Card from '$components/shadcn/card/index.js';
	import * as Tabs from '$components/shadcn/tabs/index.js';
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

	const { enhance, delayed } = form;
</script>

<svelte:head>
	<title>Segoya &mdash; {m.singleHeader()}</title>
</svelte:head>

<h1 class="mb-12 text-center">{m.singleHeader()}</h1>

<Tabs.Root value="game">
	<Tabs.List class="grid h-20 w-full sm:h-10 sm:grid-cols-2">
		<Tabs.Trigger
			class="w-80 sm:w-full"
			value="game"
		>
			{m.singleFastGame()}
		</Tabs.Trigger>

		<Tabs.Trigger value="settings">{m.singleSettings()}</Tabs.Trigger>
	</Tabs.List>

	<form
		method="post"
		class="flex flex-col"
		use:enhance
	>
		<Tabs.Content value="game">
			<Card.Root>
				<Card.Header>
					<Card.Title>{m.singleFastGame()}</Card.Title>
				</Card.Header>

				<Card.Content class="space-y-2">
					<ProviderSelect {form} />
				</Card.Content>

				<Card.Footer>
					<ButtonLoading
						type="submit"
						class="w-36"
						{delayed}
					>
						{m.play()}
					</ButtonLoading>
				</Card.Footer>
			</Card.Root>
		</Tabs.Content>

		<Tabs.Content value="settings">
			<Card.Root>
				<Card.Header>
					<Card.Title>{m.singleSettings()}</Card.Title>
				</Card.Header>

				<Card.Content class="space-y-3">
					<MainSettings {form} />
				</Card.Content>
			</Card.Root>
		</Tabs.Content>
	</form>

	<!-- {#if browser}
		<SuperDebug data={formData} />
	{/if} -->
</Tabs.Root>
