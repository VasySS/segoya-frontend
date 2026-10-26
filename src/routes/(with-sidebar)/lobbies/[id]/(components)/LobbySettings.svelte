<script lang="ts">
	import { fetchBackend } from '#lib/api/base.js';
	import type { Lobby } from '#lib/api/openapi.js';
	import { getProviderLabel } from '#lib/constants/panoramaProviders.js';
	import { isPayloadWithinLimit, normalizeArea } from '#lib/play-areas/geometry.js';
	import { formatTimerTime } from '#lib/utils/formatters.js';
	import { m } from '#paraglide/messages.js';
	import { page } from '$app/state';
	import { onDestroy, untrack } from 'svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import MainSettings from '#components/game/creation-settings/MainSettings.svelte';
	import PlayAreaSelect from '#components/game/creation-settings/PlayAreaSelect.svelte';
	import ProviderSelect from '#components/game/creation-settings/ProviderSelect.svelte';
	import PlayAreaSummary from '#components/play-areas/PlayAreaSummary.svelte';
	import { Button } from '#components/shadcn/button/index.js';
	import * as Dialog from '#components/shadcn/dialog/index.js';

	import { formSchema } from '../settingsSchema';
	import LobbyWebSocket from './LobbyWebSocket.svelte';
	import type { LobbySettingsContent } from './websocket';

	interface Props {
		lobbyWS: LobbyWebSocket | undefined;
		isSettingsOpen?: boolean;
		lobbyInfo?: Lobby;
		pending?: boolean;
		connected: boolean;
	}
	let {
		lobbyWS,
		isSettingsOpen = $bindable(false),
		lobbyInfo = $bindable(page.data.lobby as Lobby),
		pending = $bindable(false),
		connected
	}: Props = $props();

	const jwt = $derived(page.data.jwtToken as string);
	let isAreaValid = $state(false);
	let error = $state('');
	let isConflict = $state(false);
	let wasOpen = false;
	let timeout: ReturnType<typeof setTimeout> | undefined;

	const form = superForm(page.data.form, {
		validators: zod4Client(formSchema),
		multipleSubmits: 'prevent',
		dataType: 'json'
	});
	const { form: formData } = form;

	function resetDraft() {
		$formData.provider = lobbyInfo.provider;
		$formData.playArea = normalizeArea($state.snapshot(lobbyInfo.playArea));
		$formData.movementAllowed = lobbyInfo.movementAllowed;
		$formData.rounds = lobbyInfo.rounds;
		$formData.timerEnabled = lobbyInfo.timerSeconds > 0;
		$formData.timerSeconds = lobbyInfo.timerSeconds || 300;
		error = '';
		isConflict = false;
	}

	$effect(() => {
		const isOpen = isSettingsOpen;
		if (isOpen && !wasOpen) untrack(resetDraft);
		wasOpen = isOpen;
	});

	onDestroy(() => {
		clearTimeout(timeout);
	});

	export function failPending(message: string) {
		if (!pending) return;
		clearTimeout(timeout);
		pending = false;
		error = message;
	}

	async function recover() {
		failPending(m.areaSettingsTimeout());
		try {
			const response = await fetchBackend(jwt, 'get', '/v1/lobbies/{id}', {
				path: { id: lobbyInfo.id }
			});
			if (response.success) {
				lobbyInfo = response.data;
				isConflict = true;
			}
		} catch {
			error = m.areaRequestFailed();
		}
	}

	async function handleSettingsSave() {
		const res = await form.validateForm();
		if (pending || isConflict || !isAreaValid || !res.valid) return;
		if (!connected) {
			error = m.areaDisconnected();
			return;
		}

		let settings = {
			provider: $formData.provider,
			playArea: $state.snapshot($formData.playArea),
			movementAllowed: $formData.movementAllowed,
			rounds: $formData.rounds,
			timerSeconds: $formData.timerEnabled ? $formData.timerSeconds : 0
		} as LobbySettingsContent;

		if (!isPayloadWithinLimit({ type: 'settingsNew', payload: { settings } })) {
			error = m.areaPayloadTooLarge();
			return;
		}

		if (!lobbyWS?.sendSettingsMessage(settings)) {
			error = m.areaDisconnected();
			return;
		}

		pending = true;
		error = '';
		timeout = setTimeout(() => {
			void recover();
		}, 8000);
	}

	export function updateSettings(settings: LobbySettingsContent) {
		lobbyInfo = { ...lobbyInfo, ...settings, playArea: normalizeArea(settings.playArea) };
		if (pending) {
			clearTimeout(timeout);
			pending = false;
			isSettingsOpen = false;
		} else if (isSettingsOpen) isConflict = true;
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

<PlayAreaSummary
	jwt={page.data.jwtToken ?? ''}
	provider={lobbyInfo.provider}
	selection={lobbyInfo.playArea}
/>

<Dialog.Root bind:open={isSettingsOpen}>
	<Dialog.Content class="max-h-[90dvh] space-y-1 overflow-y-auto sm:max-w-4xl">
		<Dialog.Header>
			<Dialog.Title>
				{m.frail_honest_samuel_fear()}
			</Dialog.Title>

			<Dialog.Description></Dialog.Description>
		</Dialog.Header>

		<div>
			<!-- form is used to show validation errors and reuse components -->
			<form
				onsubmit={(event) => {
					event.preventDefault();
					void handleSettingsSave();
				}}
				class="space-y-3"
			>
				<ProviderSelect {form}></ProviderSelect>
				<PlayAreaSelect
					jwt={page.data.jwtToken ?? ''}
					provider={$formData.provider}
					rounds={$formData.rounds}
					bind:selection={$formData.playArea}
					bind:valid={isAreaValid}
				/>
				<p class="text-muted-foreground text-sm">
					{m.areaSharedPrivacy()}
				</p>

				<div class="pt-2"></div>

				<MainSettings {form}></MainSettings>
			</form>
		</div>

		{#if error}<p
				role="alert"
				class="text-destructive text-sm"
			>
				{error}
			</p>
		{/if}
		{#if isConflict}
			<p
				role="alert"
				class="text-destructive text-sm"
			>
				{m.areaSettingsConflict()}
			</p>
		{/if}

		<Dialog.Footer>
			<Button
				variant="outline"
				disabled={pending}
				onclick={() => (isSettingsOpen = false)}>{m.areaCancel()}</Button
			>
			<Button
				onclick={handleSettingsSave}
				disabled={!connected || !isAreaValid || pending || isConflict}
			>
				{pending ? m.areaSaving() : m.save()}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
