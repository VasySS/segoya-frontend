<script lang="ts">
	import { setGameContext } from '#lib/states/gameContext.svelte.js';
	import { m } from '#paraglide/messages.js';
	import LoadingFullscreen from '#components/game/LoadingFullscreen.svelte';

	import SingleplayerOverlay from './(components)/SingleplayerOverlay.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();

	// svelte-ignore state_referenced_locally
	const gameContext = setGameContext(data.game, data.round);
</script>

<svelte:head>
	<title>Segoya &mdash; {m.sidebarSingleplayer()}</title>
</svelte:head>

{#if !gameContext.isLoading}
	<SingleplayerOverlay />
{:else}
	<LoadingFullscreen />
{/if}
