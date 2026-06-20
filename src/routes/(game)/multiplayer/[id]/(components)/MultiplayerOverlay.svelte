<script lang="ts">
	import { page } from '$app/state';
	import BaseOverlay from '$components/game/BaseOverlay.svelte';
	import Timer from '$components/game/Timer.svelte';
	import Minimap from '$components/minimap/Minimap.svelte';
	import ButtonLoading from '$components/shared/button-loading/button-loading.svelte';
	import { fetchBackend } from '$lib/api/base';
	import type {
		MultiplayerGame,
		MultiplayerGuess,
		MultiplayerRound,
		UserPublicProfile
	} from '$lib/api/openapi';
	import { GameType, type GameTypeValues } from '$lib/constants/enums';
	import { getGameContext } from '$lib/states/gameContext.svelte';
	import { m } from '$paraglide/messages.js';
	import { toast } from 'svelte-sonner';

	import MultiplayerUsers from './MultiplayerUsers.svelte';
	import MultiplayerWebSocket from './MultiplayerWebSocket.svelte';

	interface Props {
		gameWS: MultiplayerWebSocket | undefined;
		gameUsers: MultiplayerUsers | undefined;
	}
	let { gameWS, gameUsers }: Props = $props();

	let minimap = $state<Minimap>();

	const user = page.data.user as UserPublicProfile;
	const jwt = page.data.jwtToken as string;

	const gameContext = getGameContext();
	const game = gameContext.game as MultiplayerGame;
	const round = gameContext.round as MultiplayerRound;
	const unixEpoch = Temporal.Instant.fromEpochMilliseconds(0);

	function getRoundEndTimestamp(): string {
		const endedAt = Temporal.Instant.from(round.endedAt);
		return Temporal.Instant.compare(endedAt, unixEpoch) > 0
			? round.endedAt
			: Temporal.Now.instant().toString();
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	async function sendGuess() {
		if (gameContext.userGuessed || round.finished || game.finished) {
			return;
		}

		gameContext.userGuessed = true;
		gameWS?.sendGuess(gameContext.userGuess);
		gameUsers?.handleSendGuess(user);
	}

	async function nextRound() {
		gameContext.resetUserStates();

		gameContext.isLoading = true;
		const newRoundResponse = await fetchBackend(jwt, 'post', '/v1/multiplayer/{id}/round', {
			path: { id: game.id }
		});
		gameContext.isLoading = false;

		if (!newRoundResponse.success) {
			toast.error(newRoundResponse.error.detail);
			return;
		}

		gameContext.round = newRoundResponse.data;
	}

	async function showResults() {
		const guessesResponse = await fetchBackend(jwt, 'get', '/v1/multiplayer/{id}/guesses', {
			path: { id: game.id }
		});

		if (!guessesResponse.success) {
			toast.error(guessesResponse.error.detail);
			return;
		}

		await minimap?.showMultiplayerGameEndMarkers(guessesResponse.data);
	}

	// called from MultiplayerWebSocket on message from backend
	export const endRound = async (guesses: MultiplayerGuess[]) => {
		round.finished = true;

		if (round.roundNum === game.rounds) {
			game.finished = true;
		}

		gameUsers?.handleEndRound(guesses);

		await minimap?.showMultiplayerRoundEndMarkers(guesses, round);
	};
</script>

<BaseOverlay
	gameType={GameType.MULTIPLAYER as GameTypeValues}
	{sendGuess}
	setTileProvider={minimap?.setTileProvider}
></BaseOverlay>

<!-- TOP RIGHT -->
<div
	id="topRight"
	class="bg-background fixed top-2 right-4 z-10 w-60 space-y-3 rounded-sm p-3 px-6"
>
	<p>{m.overlayRound()} {round.roundNum} {m.overlayOf()} {game.rounds}</p>

	{#if gameContext.game.timerSeconds != 0 && !round.finished && !game.finished}
		<!-- the timer is set to end a second early for auto-guess to work -->
		<Timer
			startTimestamp={round.startedAt}
			duration={game.timerSeconds - 1}
			showTimeAboveDuration={false}
			playSounds={true}
			timerText={m.crisp_free_vole_edit()}
			timerEndCallback={async () => {
				setTimeout(() => {
					gameWS?.sendEndRound();
				}, 1000);

				await sendGuess();
			}}
		/>
	{:else if round.finished && !game.finished && round.roundNum < game.rounds}
		<Timer
			startTimestamp={getRoundEndTimestamp()}
			duration={10}
			timerText={m.sound_large_panther_hurl()}
			timerEndCallback={() => nextRound()}
		/>
	{/if}
</div>

<!-- /TOP RIGHT -->

<!-- BOTTOM RIGHT -->
<Minimap
	bind:this={minimap}
	{user}
/>

{#if game.finished}
	<ButtonLoading
		class="fixed right-4 bottom-8 z-10 w-80 text-xl"
		funcWithLoading={showResults}
		onclick={async (e: Event) => {
			const btn = e.currentTarget as HTMLButtonElement;
			btn.disabled = true;

			await showResults();
		}}
	>
		{m.weary_away_penguin_cure()}
	</ButtonLoading>
{/if}
<!-- /BOTTOM RIGHT -->
