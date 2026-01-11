<script lang="ts">
	import { page } from '$app/state';
	import MainSettings from '$components/game/creation-settings/MainSettings.svelte';
	import ProviderSelect from '$components/game/creation-settings/ProviderSelect.svelte';
	import { Button } from '$components/shadcn/button/index';
	import * as Dialog from '$components/shadcn/dialog/index';
	import type { Lobby } from '$lib/api/openapi';
	import { getProviderLabel } from '$lib/constants/panoramaProviders';
	import { formatTimerTime } from '$lib/utils/formatters';
	import { m } from '$paraglide/messages.js';
	import { onMount } from 'svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';

	import { formSchema } from '../settingsSchema';
	import LobbyWebSocket from './LobbyWebSocket.svelte';
	import type { LobbySettingsContent } from './websocket';

	interface Props {
		lobbyWS: LobbyWebSocket | undefined;
		settingsOpen: boolean;
		lobbyInfo: Lobby;
	}
	// eslint-disable-next-line @typescript-eslint/no-useless-default-assignment
	let { lobbyWS, settingsOpen = $bindable(false), lobbyInfo }: Props = $props();

	const form = superForm(page.data.form, {
		validators: zod4Client(formSchema),
		multipleSubmits: 'prevent',
		dataType: 'json'
	});
	const { form: formData, enhance } = form;

	onMount(() => {
		// initialize form with current lobby settings
		$formData.provider = lobbyInfo.provider;
		$formData.movementAllowed = lobbyInfo.movementAllowed;
		$formData.rounds = lobbyInfo.rounds;
		$formData.timerEnabled = lobbyInfo.timerSeconds > 0;
		$formData.timerSeconds = lobbyInfo.timerSeconds;
	});

	async function handleSettingsSave() {
		const res = await form.validateForm();
		if (!res.valid) return;

		let settings = {
			provider: $formData.provider,
			movementAllowed: $formData.movementAllowed,
			rounds: $formData.rounds,
			timerSeconds: $formData.timerEnabled ? $formData.timerSeconds : 0
		} as LobbySettingsContent;

		lobbyWS?.sendSettingsMessage(settings);
		settingsOpen = false;
	}

	export function updateSettings(settings: LobbySettingsContent) {
		lobbyInfo.provider = settings.provider;
		lobbyInfo.movementAllowed = settings.movementAllowed;
		lobbyInfo.rounds = settings.rounds;
		lobbyInfo.timerSeconds = settings.timerSeconds;
	}
</script>

<div class="flex flex-row items-center">
	<h3 class="text-muted-foreground text-sm font-medium">
		{m.frail_honest_samuel_fear()}
	</h3>

	<div class="flex-1"></div>
</div>

<div class="space-y-3">
	<div class="flex justify-between">
		<span class="text-sm">{m.panoramaProvider()}:</span>
		<span class="text-sm font-medium">
			{getProviderLabel(lobbyInfo.provider)}
		</span>
	</div>

	<div class="flex justify-between">
		<span class="text-sm">{m.totalRounds()}:</span>
		<span class="text-sm font-medium">{lobbyInfo.rounds}</span>
	</div>

	<div class="flex justify-between">
		<span class="text-sm">{m.movementEnabled()}:</span>
		<span class="text-sm font-medium">
			{#if lobbyInfo.movementAllowed}
				{m.enabled()}
			{:else}
				{m.disabled()}
			{/if}
		</span>
	</div>

	<div class="flex justify-between">
		<span class="text-sm">{m.timeForRound()}:</span>
		<span class="text-sm font-medium">
			{#if lobbyInfo.timerSeconds !== 0}
				{formatTimerTime(lobbyInfo.timerSeconds)}
			{:else}
				{m.disabled()}
			{/if}
		</span>
	</div>
</div>

<Dialog.Root bind:open={settingsOpen}>
	<Dialog.Content class="space-y-1">
		<Dialog.Header>
			<Dialog.Title>
				{m.frail_honest_samuel_fear()}
			</Dialog.Title>

			<Dialog.Description></Dialog.Description>
		</Dialog.Header>

		<div>
			<!-- form is used to show validation errors and reuse components -->
			<form
				method="post"
				use:enhance
				class="space-y-3"
			>
				<ProviderSelect {form}></ProviderSelect>

				<div class="pt-2"></div>

				<MainSettings {form}></MainSettings>
			</form>
		</div>

		<Dialog.Footer>
			<Button onclick={handleSettingsSave}>
				{m.save()}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
