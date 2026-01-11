<!-- 
@component
A component, that allows user to change settings (stored in local storage)
-->
<script lang="ts">
	import { CircleQuestionMark, Play } from '@lucide/svelte';
	import { asset } from '$app/paths';
	import { Button } from '$components/shadcn/button/index';
	import * as Dialog from '$components/shadcn/dialog/index';
	import Label from '$components/shadcn/label/label.svelte';
	import * as Select from '$components/shadcn/select/index';
	import Slider from '$components/shadcn/slider/slider.svelte';
	import Switch from '$components/shadcn/switch/switch.svelte';
	import * as Tooltip from '$components/shadcn/tooltip/index';
	import { STATIC_BASE_URL } from '$lib/api/base';
	import { minimapProviders } from '$lib/constants/minimapProviders';
	import { UserSettingsStore } from '$lib/states/localStorage.svelte';
	import { m } from '$paraglide/messages.js';
	import { onMount } from 'svelte';

	interface Props {
		settingsOpen?: boolean;
		// for refreshing map in-game without reloading
		setTileProvider?: ((provider: string) => void) | undefined;
	}

	let { settingsOpen = $bindable(false), setTileProvider }: Props = $props();

	const userSettings = UserSettingsStore;

	let alertSound: HTMLAudioElement;

	onMount(() => {
		alertSound = new Audio(asset('/sounds/alert1.mp3'));
	});

	$effect(() => {
		alertSound.volume = $userSettings.sounds.volume;
	});
</script>

<Dialog.Root bind:open={settingsOpen}>
	<Dialog.Content class="space-y-1">
		<Dialog.Header>
			<Dialog.Title>{m.profileTabSettings()}</Dialog.Title>
			<Dialog.Description></Dialog.Description>
		</Dialog.Header>

		<div class="space-y-2">
			<Label for="minimap-provider">{m.profileMinimapProvider()}</Label>

			<div class="flex flex-row items-center space-x-3">
				<Select.Root
					value={$userSettings.minimapProvider}
					type="single"
					onValueChange={(v: string) => {
						userSettings.update((s) => ({
							...s,
							minimapProvider: v
						}));

						// for refreshing map in-game without reloading
						setTileProvider?.(v);
					}}
				>
					<Select.Trigger
						class="w-52"
						id="minimap-provider"
					>
						{minimapProviders.find((p) => p.value === $userSettings.minimapProvider)?.label}
					</Select.Trigger>

					<Select.Content>
						{#each minimapProviders as provider (provider.value)}
							<Select.Item
								value={provider.value}
								label={provider.label}
							>
								{provider.label}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>

				<Tooltip.Provider>
					<Tooltip.Root>
						<Tooltip.Trigger>
							<CircleQuestionMark />
						</Tooltip.Trigger>

						<Tooltip.Content>
							<p>{m.red_small_goldfish_read()}:</p>

							<div class="flex flex-row space-x-2">
								<Button
									target="_blank"
									variant="link"
									href="{STATIC_BASE_URL}/osm_provider.png"
								>
									OpenStreetMap
								</Button>

								<Button
									target="_blank"
									variant="link"
									href="{STATIC_BASE_URL}/carto_provider.png"
								>
									CARTO
								</Button>
							</div>
						</Tooltip.Content>
					</Tooltip.Root>
				</Tooltip.Provider>
			</div>
		</div>

		<div class="flex flex-row items-center space-x-4">
			<Label for="compass">{m.top_witty_snake_dart()}</Label>

			<div class="flex flex-row items-center space-x-3">
				<Switch
					checked={$userSettings.compassEnabled}
					onCheckedChange={(v) => {
						userSettings.update((s) => ({
							...s,
							compassEnabled: v
						}));
					}}
					id="compass"
				></Switch>

				<Tooltip.Provider>
					<Tooltip.Root>
						<Tooltip.Trigger>
							<CircleQuestionMark />
						</Tooltip.Trigger>
						<Tooltip.Content>
							<p>{m.game_short_jackdaw_peek()}</p>
						</Tooltip.Content>
					</Tooltip.Root>
				</Tooltip.Provider>
			</div>
		</div>

		<div class="flex flex-col space-y-6">
			<div class="flex flex-row items-center space-x-4">
				<Label for="gameSounds">
					{m.few_teal_tuna_compose()}
				</Label>

				<Switch
					checked={$userSettings.sounds.enabled}
					onCheckedChange={(v) => {
						userSettings.update((s) => ({
							...s,
							sounds: {
								...s.sounds,
								enabled: v
							}
						}));
					}}
					id="gameSounds"
				></Switch>

				{#if $userSettings.sounds.enabled}
					<p>{`(${Math.round($userSettings.sounds.volume * 100).toString()} %)`}</p>

					<Button
						onclick={() => {
							alertSound.pause();
							alertSound.currentTime = 0;
							void alertSound.play();
						}}
					>
						<Play></Play>
					</Button>
				{/if}
			</div>

			{#if $userSettings.sounds.enabled}
				<Slider
					value={$userSettings.sounds.volume * 100}
					onValueChange={(v) => {
						userSettings.update((s) => ({
							...s,
							sounds: {
								...s.sounds,
								volume: v / 100
							}
						}));
					}}
					type="single"
					class="w-72"
					min={1}
					max={100}
				/>
			{/if}
		</div>
		<Dialog.Footer></Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
