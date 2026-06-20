<script lang="ts">
	import { page } from '$app/state';
	import BaseOverlay from '$components/game/BaseOverlay.svelte';
	import RoundAnimation from '$components/game/ScoreDistanceAnimated.svelte';
	import Timer from '$components/game/Timer.svelte';
	import Minimap from '$components/minimap/Minimap.svelte';
	import Button from '$components/shadcn/button/button.svelte';
	import ButtonLoading from '$components/shared/button-loading/button-loading.svelte';
	import { fetchBackend } from '$lib/api/base';
	import type {
		EndSingleplayerRoundResponse,
		SingleplayerGame,
		UserPublicProfile
	} from '$lib/api/openapi';
	import { GameType } from '$lib/constants/enums';
	import { getGameContext } from '$lib/states/gameContext.svelte';
	import { m } from '$paraglide/messages.js';
	import { toast } from 'svelte-sonner';

	let minimap = $state<Minimap>();
	let roundResult = $state<EndSingleplayerRoundResponse>();

	const user = page.data.user as UserPublicProfile;
	const jwt = page.data.jwtToken as string;

	const gameContext = getGameContext();
	const game = gameContext.game as SingleplayerGame;
	const round = gameContext.round;

	async function sendGuess() {
		if (gameContext.userGuessed || round.finished || game.finished) {
			return;
		}

		const endRoundResponse = await fetchBackend(jwt, 'post', '/v1/singleplayer/{id}/round/end', {
			path: { id: game.id },
			body: {
				guess: gameContext.userGuess
			}
		});

		if (!endRoundResponse.success) {
			toast.error(endRoundResponse.error.detail);
			return;
		}

		roundResult = endRoundResponse.data;

		game.score += roundResult.score;
		minimap?.showSingleplayerRoundEndMarkers(round);

		// TODO - delete and move to backend? just leave a game.finished = true
		if (round.roundNum === game.rounds) {
			await endGame();
		}

		round.finished = true;
	}

	async function nextRound() {
		gameContext.resetUserStates();

		gameContext.isLoading = true;
		const newRoundResponse = await fetchBackend(jwt, 'post', '/v1/singleplayer/{id}/round', {
			path: { id: game.id }
		});
		gameContext.isLoading = false;

		if (!newRoundResponse.success) {
			toast.error(newRoundResponse.error.detail);
			return;
		}

		gameContext.round = newRoundResponse.data;
	}

	// TODO - remove?
	async function endGame() {
		game.finished = true;

		const endGameResponse = await fetchBackend(jwt, 'post', '/v1/singleplayer/{id}/end', {
			path: { id: game.id }
		});

		if (!endGameResponse.success) {
			toast.error(endGameResponse.error.detail);
			return;
		}
	}

	async function showResults() {
		const guessesResponse = await fetchBackend(jwt, 'get', '/v1/singleplayer/{id}/guesses', {
			path: { id: game.id }
		});

		if (!guessesResponse.success) {
			toast.error(guessesResponse.error.detail);
			return;
		}

		minimap?.showSingleplayerGameEndMarkers(guessesResponse.data);
	}
</script>

<BaseOverlay
	gameType={GameType.SINGLEPLAYER}
	{sendGuess}
	setTileProvider={minimap?.setTileProvider}
></BaseOverlay>

<!-- TOP RIGHT -->
<div
	class="fixed top-2 right-2 z-30 w-52 sm:w-60"
	id="topRight"
>
	<div class="bg-background rounded-sm p-3">
		<p>{m.overlayGameScore()}: {game.score}</p>
		<p>{m.overlayRound()} {round.roundNum} {m.overlayOf()} {game.rounds}</p>

		{#if game.timerSeconds != 0 && !round.finished && !game.finished}
			<!-- the timer is set to end a second early for auto-guess to work -->
			<Timer
				startTimestamp={round.startedAt}
				duration={game.timerSeconds - 1}
				showTimeAboveDuration={false}
				playSounds={true}
				timerText={m.crisp_free_vole_edit()}
				timerEndCallback={async () => {
					if (!gameContext.userGuessed) await sendGuess();
				}}
			/>
		{/if}
	</div>

	{#if round.finished && !game.finished}
		<ButtonLoading
			class="mt-2 w-full p-1 px-3 text-xl"
			funcWithLoading={nextRound}
		>
			{m.overlayNextRound()}
		</ButtonLoading>
	{/if}
</div>

<!-- /TOP RIGHT -->

<!-- BOTTOM RIGHT -->
<Minimap
	bind:this={minimap}
	{user}
/>

{#if !game.finished && roundResult}
	<div
		data-testid="round-results-block"
		class="bg-primary fixed right-4 bottom-8 z-10 flex w-72 p-1 text-xl"
	>
		<RoundAnimation
			score={roundResult.score}
			distance={roundResult.distance}
		/>
	</div>
{/if}

{#if game.finished}
	<Button
		class="fixed right-4 bottom-8 z-10 w-80 text-xl"
		onclick={async (e: Event) => {
			const btn = e.currentTarget as HTMLButtonElement;
			btn.disabled = true;

			await showResults();
		}}
	>
		{m.weary_away_penguin_cure()}</Button
	>
{/if}
<!-- /BOTTOM RIGHT -->
