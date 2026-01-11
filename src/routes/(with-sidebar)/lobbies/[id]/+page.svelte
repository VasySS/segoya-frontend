<script lang="ts">
	import { Lock, SettingsIcon } from '@lucide/svelte';
	import Share2 from '@lucide/svelte/icons/share-2';
	import { browser } from '$app/environment';
	import { Badge } from '$components/shadcn/badge/index';
	import Button from '$components/shadcn/button/button.svelte';
	import * as Card from '$components/shadcn/card/index';
	import * as Tooltip from '$components/shadcn/tooltip/index';
	import type { Lobby } from '$lib/api/openapi';
	import { m } from '$paraglide/messages.js';
	import { toast } from 'svelte-sonner';

	import LobbyChat from './(components)/LobbyChat.svelte';
	import LobbySettings from './(components)/LobbySettings.svelte';
	import LobbyUsers from './(components)/LobbyUsers.svelte';
	import LobbyWebSocket from './(components)/LobbyWebSocket.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();

	// svelte-ignore state_referenced_locally
	const jwtPayload = data.jwtPayload;

	let settingsOpen = $state(false);
	// svelte-ignore state_referenced_locally
	let lobbyInfo = $state<Lobby>(data.lobby);

	let lobbyWS = $state<LobbyWebSocket>();
	let lobbyUsers = $state<LobbyUsers>();
	let lobbyChat = $state<LobbyChat>();
	let lobbySettings = $state<LobbySettings>();
</script>

<svelte:head>
	<title>Segoya &mdash; {m.lobby()} {lobbyInfo.id}</title>
</svelte:head>

<h1 class="text-center">{m.lobby()}</h1>
<div class="flex flex-row items-center justify-center space-x-4 pb-12">
	<p class="text-base sm:text-2xl">{lobbyInfo.id}</p>

	{#if lobbyInfo.private}
		<div class="flex">
			<Tooltip.Provider>
				<Tooltip.Root>
					<Tooltip.Trigger>
						<Lock class="text-red-700"></Lock>
					</Tooltip.Trigger>

					<Tooltip.Content>{m.giant_fresh_kestrel_cut()}</Tooltip.Content>
				</Tooltip.Root>
			</Tooltip.Provider>
		</div>
	{/if}
</div>

{#if browser}
	<LobbyWebSocket
		bind:this={lobbyWS}
		{lobbyChat}
		{lobbyUsers}
		{lobbySettings}
	></LobbyWebSocket>
{/if}

<Card.Root>
	<Card.Header class="pb-2">
		<Card.Description class="flex items-center gap-2">
			<Badge
				variant="outline"
				class="text-sm font-semibold"
			>
				{m.players()}: {lobbyUsers?.getUsersCount()}/{lobbyInfo.maxPlayers}
			</Badge>

			<div class="flex-1"></div>

			<Button
				onclick={async () => {
					if (!browser) return;

					await navigator.clipboard.writeText(globalThis.location.href);

					toast.success(m.lobbyLinkCopied());
				}}
				title={m.copyJoinLink()}
			>
				<Share2 class="size-5" />
			</Button>

			{#if lobbyInfo.creatorID === jwtPayload.userID}
				<Button onclick={() => (settingsOpen = !settingsOpen)}>
					<SettingsIcon></SettingsIcon>
				</Button>
			{/if}
		</Card.Description>
	</Card.Header>

	<Card.Content>
		<div class="flex flex-col gap-6 md:flex-row">
			<!-- left column -->
			<LobbyUsers
				bind:this={lobbyUsers}
				{lobbyInfo}
			></LobbyUsers>

			<!-- right column -->
			<div class="flex-1 space-y-4 md:pl-6">
				<LobbySettings
					bind:this={lobbySettings}
					bind:settingsOpen
					{lobbyWS}
					{lobbyInfo}
				></LobbySettings>
			</div>
		</div>
	</Card.Content>

	<Card.Footer>
		{#if lobbyInfo.creatorID === jwtPayload.userID && lobbyUsers?.getUsersCount() >= 2}
			<Button
				onclick={lobbyWS?.sendGameStartMessage}
				class="mt-8 w-32"
			>
				{m.play()}
			</Button>
		{:else if lobbyInfo.creatorID === jwtPayload.userID}
			<p class="text-muted-foreground text-center text-sm">
				{m.polite_pretty_robin_roam()}
			</p>
		{:else}
			<p class="text-muted-foreground text-center text-sm">
				{m.gray_arable_elk_twist()}
			</p>
		{/if}
	</Card.Footer>
</Card.Root>

<LobbyChat
	bind:this={lobbyChat}
	{lobbyWS}
	username={jwtPayload.username}
></LobbyChat>
