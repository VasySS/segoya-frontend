<script lang="ts">
	import { m } from '#paraglide/messages.js';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import MainSettings from '#components/game/creation-settings/MainSettings.svelte';
	import PlayAreaSelect from '#components/game/creation-settings/PlayAreaSelect.svelte';
	import ProviderSelect from '#components/game/creation-settings/ProviderSelect.svelte';
	import * as Card from '#components/shadcn/card/index.js';
	import * as Tabs from '#components/shadcn/tabs/index.js';
	import ButtonLoading from '#components/shared/button-loading/button-loading.svelte';

	import type { PageProps } from './$types';
	import { formSchema } from './schema';

	let { data }: PageProps = $props();
	let isAreaEligible = $state(false);
	let revision = $state(0);

	// svelte-ignore state_referenced_locally
	const form = superForm(data.form, {
		validators: zod4Client(formSchema),
		multipleSubmits: 'prevent',
		dataType: 'json',
		onSubmit: ({ cancel }) => {
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Updated through the child component binding.
			if (!isAreaEligible) cancel();
		},
		onResult: () => {
			revision++;
		}
	});

	const { form: formData, enhance, delayed, message } = form;
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
					<PlayAreaSelect
						jwt={data.jwtToken ?? ''}
						provider={$formData.provider}
						rounds={$formData.rounds}
						bind:selection={$formData.playArea}
						bind:eligible={isAreaEligible}
						{revision}
					/>
					{#if $message}
						<p
							role="alert"
							class="text-destructive text-sm"
						>
							{$message}
						</p>
					{/if}
				</Card.Content>

				<Card.Footer>
					<ButtonLoading
						type="submit"
						class="w-36"
						{delayed}
						disabled={!isAreaEligible}
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
