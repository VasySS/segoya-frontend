<script lang="ts">
	import { asset } from '$app/paths';
	import * as Avatar from '$components/shadcn/avatar/index';
	import type { MultiplayerGuess, MultiplayerRound, UserPublicProfile } from '$lib/api/openapi';
	import { getGameContext } from '$lib/states/gameContext.svelte';
	import { UserSettingsStore } from '$lib/states/localStorage.svelte';
	import type { MultiplayerGameInfo } from '$lib/types/game';
	import type { MultiplayerUser } from '$lib/types/user';
	import { getAvatarSource } from '$lib/utils/helpers';
	import { m } from '$paraglide/messages.js';

	import MultiplayerWebSocket from './MultiplayerWebSocket.svelte';

	interface Props {
		gameWS: MultiplayerWebSocket | undefined;
	}
	let { gameWS }: Props = $props();

	const userSettings = UserSettingsStore;
	const gameContext = getGameContext();
	const game = gameContext.game as MultiplayerGameInfo;
	const round = gameContext.round as MultiplayerRound;

	const guessSound = new Audio(asset('/sounds/alert1.mp3'));
	guessSound.volume = $userSettings.sounds.volume;

	export const handleUsersConnected = (users: MultiplayerUser[]) => {
		game.usersInfo = users.toSorted((u1, u2) => {
			return u2.score - u1.score;
		});
	};

	export const handleUserConnected = (user: MultiplayerUser) => {
		for (const u of game.usersInfo) {
			if (u.username === user.username) {
				u.connected = true;
				break;
			}
		}
	};

	export const handleUserDisconnected = (username: string) => {
		for (const u of game.usersInfo) {
			if (u.username === username) {
				u.connected = false;
				break;
			}
		}
	};

	export const handleUserGuessed = async (username: string) => {
		for (const u of game.usersInfo) {
			if (u.username === username) {
				u.guessed = true;
				break;
			}
		}

		if ($userSettings.sounds.enabled) {
			await guessSound.play();
		}

		round.guessesCount++;

		// for more reliability, on the last guess every player would send the message to end the round,
		// not only the one who guessed
		if (round.guessesCount === game.players) {
			gameWS?.sendEndRound();
		}
	};

	export const handleSendGuess = (user: UserPublicProfile) => {
		game.usersInfo = game.usersInfo.map((u) => {
			if (u.username === user.username) {
				u.guessed = true;
			}
			return u;
		});
	};

	export const handleEndRound = (guesses: MultiplayerGuess[]) => {
		for (const user of game.usersInfo) {
			for (const guess of guesses) {
				if (guess.username === user.username) {
					user.score += guess.score;
				}
			}
		}

		game.usersInfo.sort((u1, u2) => {
			return u2.score - u1.score;
		});
	};
</script>

<div class="bg-background fixed top-40 right-4 z-10 w-60 space-y-3 rounded-sm p-3 px-4">
	<p>{m.players()} ({round.guessesCount}/{game.players} {m.wacky_light_kudu_reap()})</p>

	<div class="space-y-3">
		{#each game.usersInfo as u (u.username)}
			<div class="bg-secondary flex flex-row items-center space-x-3 rounded-sm p-1.5">
				<Avatar.Root class="size-8">
					<Avatar.Image
						src={getAvatarSource(u.avatarHash, u.username)}
						alt="avatar"
						loading="lazy"
					/>
				</Avatar.Root>

				<p class="">{u.username} : {u.score}</p>
				<div>
					{#if u.guessed}
						<div
							class="absolute right-0 -mt-5 h-10 animate-pulse bg-green-600 pr-2 pl-1"
							title={m.slimy_noble_sloth_splash()}
						></div>
					{:else if u.connected}
						<div
							class="absolute right-0 -mt-5 h-10 bg-green-600 pr-2 pl-1"
							title={m.proud_pink_panda_kiss()}
						></div>
					{:else}
						<div
							class="absolute right-0 -mt-5 h-10 bg-red-600 pr-2 pl-1"
							title={m.big_clean_lark_pave()}
						></div>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>
