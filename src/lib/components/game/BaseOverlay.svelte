<script lang="ts">
	import { ExternalLink, Flag, Minus, Plus, SettingsIcon } from '@lucide/svelte';
	import { resolve } from '$app/paths';
	import Settings from '$components/game/Settings.svelte';
	import PanoramaContainer from '$components/panoramas/PanoramaContainer.svelte';
	import * as ButtonGroup from '$components/shadcn/button-group/index.js';
	import { Button } from '$components/shadcn/button/index';
	import ButtonLoading from '$components/shared/button-loading/button-loading.svelte';
	import { GameType, type GameTypeValues } from '$lib/constants/enums';
	import { getGameContext } from '$lib/states/gameContext.svelte';
	import { panoURL } from '$lib/utils/panoURL';
	import { m } from '$paraglide/messages.js';

	interface Props {
		gameType: GameTypeValues;
		sendGuess: () => Promise<void>;
		setTileProvider: ((provider: string) => void) | undefined;
	}
	let { gameType, sendGuess, setTileProvider }: Props = $props();

	let panorama = $state<PanoramaContainer>();
	let settingsOpen = $state(false);

	const gameContext = getGameContext();
	const game = gameContext.game;
	const round = gameContext.round;

	async function handleSpacePress(e: KeyboardEvent) {
		if (e.code === 'Space') {
			e.preventDefault();
			await sendGuess();
		}
	}
</script>

<svelte:window onkeydown={handleSpacePress} />

<PanoramaContainer bind:this={panorama} />

<!-- a dialog, opened with the settings button in-game -->
<Settings
	bind:settingsOpen
	{setTileProvider}
/>

<!-- TOP LEFT -->
<a
	class="bg-secondary/90 fixed top-2 left-2 z-10 w-32 rounded-sm pl-1"
	href={resolve(
		gameType === GameType.SINGLEPLAYER ? '/(with-sidebar)/quick-game' : '/(with-sidebar)/lobbies'
	)}
>
	<h2 class="p-2">Segoya</h2>
</a>
<!-- TOP LEFT -->

<!-- BOTTOM LEFT -->
<!--  first column -->
<ButtonGroup.Root
	orientation="vertical"
	class="fixed bottom-8 left-4 z-10"
>
	<Button
		class="border-foreground size-12 border p-2"
		onclick={panorama?.zoomIn}
	>
		<Plus size={24} />
	</Button>
	<Button
		class="border-foreground size-12 border p-2"
		onclick={panorama?.zoomOut}
	>
		<Minus size={24} />
	</Button>

	<Button
		class="border-foreground size-12 border p-1"
		onclick={() => (settingsOpen = !settingsOpen)}
		title={m.singleSettings()}
	>
		<SettingsIcon size={24} />
	</Button>
</ButtonGroup.Root>

<!--  second column -->
<ButtonGroup.Root
	orientation="vertical"
	class="fixed bottom-8 left-20 z-10"
>
	{#if round.finished}
		<Button
			class="border-foreground size-12 border p-2"
			title={m.overlayPanoNewTab()}
			href={panoURL(game.provider, round.streetviewID, round.lat, round.lng)}
			target="_blank"
		>
			<ExternalLink size={24} />
		</Button>
	{/if}

	<Button
		class="border-foreground size-12 border p-2"
		onclick={panorama?.returnToStart}
		title={m.overlayReturnToStart()}
	>
		<Flag size={24} />
	</Button>
</ButtonGroup.Root>
<!-- BOTTOM LEFT -->

<!-- BOTTOM RIGHT -->

{#if !round.finished && !game.finished && !gameContext.userGuessed && gameContext.userPlacedMarker}
	<ButtonLoading
		class="fixed right-4 bottom-8 z-10 h-12 w-52 sm:w-72 sm:text-xl"
		funcWithLoading={sendGuess}
	>
		{m.overlayGuess()}
	</ButtonLoading>
{:else if !round.finished && !game.finished && !gameContext.userPlacedMarker}
	<Button
		class="fixed right-4 bottom-8 z-10 h-12 w-52 sm:w-72 sm:text-xl"
		disabled
	>
		{m.clickOnMinimap()}
	</Button>
{/if}
<!-- /BOTTOM RIGHT -->
