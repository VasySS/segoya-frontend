<script lang="ts">
	import CircleHelp from '@lucide/svelte/icons/circle-help';
	import * as Form from '$components/shadcn/form/index';
	import * as Select from '$components/shadcn/select/index';
	import * as Tooltip from '$components/shadcn/tooltip/index';
	import { getProviderLabel, providers } from '$lib/constants/panoramaProviders';
	import { m } from '$paraglide/messages.js';
	import type { FormSchema as MultiplayerSchema } from '$routes/(with-sidebar)/lobbies/new/schema';
	import type { FormSchema as SingleplayerSchema } from '$routes/(with-sidebar)/quick-game/schema';
	import type { Infer, SuperForm } from 'sveltekit-superforms';

	interface Props {
		form: SuperForm<Infer<SingleplayerSchema> | Infer<MultiplayerSchema>>;
	}
	let { form }: Props = $props();

	// svelte-ignore state_referenced_locally
	const { form: formData } = form;
</script>

<Form.Field
	{form}
	name="provider"
>
	<Form.Control>
		{#snippet children({ props })}
			<Form.Label>{m.panoramaProvider()}</Form.Label>

			<Select.Root
				{...props}
				bind:value={$formData.provider}
				required
				type="single"
			>
				<div class="flex flex-row space-x-2">
					<Select.Trigger
						class="w-60"
						data-testid="provider-select"
					>
						{getProviderLabel($formData.provider)}
					</Select.Trigger>

					<Tooltip.Provider>
						<Tooltip.Root>
							<Tooltip.Trigger>
								<CircleHelp />
							</Tooltip.Trigger>

							<Tooltip.Content>
								<p>{m.providerTooltipGoogle()}</p>
								<p>{m.providerTooltipYandex()}</p>
								<p>{m.providerTooltipSeznam()}</p>
							</Tooltip.Content>
						</Tooltip.Root>
					</Tooltip.Provider>
				</div>

				<Select.Content id="provider">
					{#each providers as provider (provider.value)}
						<Select.Item
							value={provider.value}
							label={provider.label}
						>
							{provider.label}
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		{/snippet}
	</Form.Control>

	<Form.FieldErrors />
</Form.Field>
