<script lang="ts">
	import * as Form from '$components/shadcn/form/index';
	import { Input } from '$components/shadcn/input/index';
	import Slider from '$components/shadcn/slider/slider.svelte';
	import { Switch } from '$components/shadcn/switch/index';
	import { formatTimerTime } from '$lib/utils/formatters';
	import { m } from '$paraglide/messages.js';
	import type { FormSchema as LobbySettingsSchema } from '$routes/(with-sidebar)/lobbies/[id]/settingsSchema';
	import type { FormSchema as MultiplayerSchema } from '$routes/(with-sidebar)/lobbies/new/schema';
	import type { FormSchema as SingleplayerSchema } from '$routes/(with-sidebar)/quick-game/schema';
	import { slide } from 'svelte/transition';
	import { type Infer, type SuperForm } from 'sveltekit-superforms';

	interface Props {
		form: SuperForm<
			// eslint-disable-next-line @typescript-eslint/no-duplicate-type-constituents
			Infer<SingleplayerSchema> | Infer<MultiplayerSchema> | Infer<LobbySettingsSchema>
		>;
	}
	let { form }: Props = $props();

	// svelte-ignore state_referenced_locally
	const { form: formData } = form;
</script>

<Form.Field
	{form}
	name="movementAllowed"
>
	<Form.Control>
		{#snippet children({ props })}
			<div class="flex items-center space-x-4">
				<Form.Label>{m.movementEnabled()}</Form.Label>

				<Switch
					{...props}
					bind:checked={$formData.movementAllowed}
				/>
			</div>
		{/snippet}
	</Form.Control>

	<Form.FieldErrors />
</Form.Field>

<Form.Field
	{form}
	name="rounds"
>
	<Form.Control>
		{#snippet children({ props })}
			<div class="flex items-center space-x-4">
				<Form.Label>{m.totalRounds()}</Form.Label>
				<Input
					{...props}
					bind:value={$formData.rounds}
					type="number"
					class="w-20"
					min={1}
					max={10}
				/>
			</div>
		{/snippet}
	</Form.Control>

	<Form.FieldErrors />
</Form.Field>

<Form.Field
	{form}
	name="timerEnabled"
>
	<Form.Control>
		{#snippet children({ props })}
			<div class="flex items-center space-x-4">
				<Form.Label>{m.such_spicy_cow_lend()}</Form.Label>
				<Switch
					{...props}
					bind:checked={$formData.timerEnabled}
				/>
			</div>
		{/snippet}
	</Form.Control>

	<Form.FieldErrors />
</Form.Field>

{#if $formData.timerEnabled}
	<Form.Field
		class="mt-3"
		{form}
		name="timerSeconds"
	>
		<Form.Control>
			{#snippet children({ props })}
				<div
					class="space-y-3"
					transition:slide
				>
					<div class="flex items-center space-x-4">
						<Form.Label>{m.timeForRound()}</Form.Label>
						<p>{formatTimerTime($formData.timerSeconds)}</p>
					</div>

					<Slider
						{...props}
						bind:value={$formData.timerSeconds}
						type="single"
						class="w-64"
						min={10}
						max={600}
						step={5}
					/>
				</div>
			{/snippet}
		</Form.Control>

		<Form.FieldErrors />
	</Form.Field>
{/if}
