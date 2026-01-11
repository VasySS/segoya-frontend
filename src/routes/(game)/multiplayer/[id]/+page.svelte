<script lang="ts">
	import LoadingFullscreen from '$components/game/LoadingFullscreen.svelte';
	import { setGameContext } from '$lib/states/gameContext.svelte';
	import { m } from '$paraglide/messages.js';

	import MultiplayerOverlay from './(components)/MultiplayerOverlay.svelte';
	import MultiplayerUsers from './(components)/MultiplayerUsers.svelte';
	import MultiplayerWebSocket from './(components)/MultiplayerWebSocket.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();

	let gameWS = $state<MultiplayerWebSocket>();
	let gameOverlay = $state<MultiplayerOverlay>();
	let gameUsers = $state<MultiplayerUsers>();

	// svelte-ignore state_referenced_locally
	const gameContext = setGameContext(data.game, data.round);
</script>

<svelte:head>
	<title>Segoya &mdash; {m.sidebarMultiplayer()}</title>
</svelte:head>

<MultiplayerWebSocket
	bind:this={gameWS}
	{gameOverlay}
	{gameUsers}
/>

{#if !gameContext.isLoading}
	<MultiplayerOverlay
		bind:this={gameOverlay}
		{gameWS}
		{gameUsers}
	/>

	<MultiplayerUsers
		bind:this={gameUsers}
		{gameWS}
	></MultiplayerUsers>
{:else}
	<LoadingFullscreen />
{/if}
