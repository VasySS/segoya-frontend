<script lang="ts">
	import type { LatLng, MultiplayerGame, UserPublicProfile } from '#lib/api/openapi.js';
	import { getMultiplayerWebSocketURL } from '#lib/api/websocket.js';
	import { getGameContext } from '#lib/states/gameContext.svelte.js';
	import { m } from '#paraglide/messages.js';
	import { page } from '$app/state';
	import WebSocketClient from '#components/shared/websocket/WebSocketClient.svelte';
	import { toast } from 'svelte-sonner';

	import MultiplayerOverlay from './MultiplayerOverlay.svelte';
	import MultiplayerUsers from './MultiplayerUsers.svelte';
	import type { MultiplayerInputMessage, RoundEndMessage, UserGuessMessage } from './websocket';

	interface Props {
		gameOverlay: MultiplayerOverlay | undefined;
		gameUsers: MultiplayerUsers | undefined;
	}
	let { gameOverlay, gameUsers }: Props = $props();

	let ws = $state<WebSocketClient>();
	let isAdmitted = false;

	const jwt = page.data.jwtToken as string;

	const gameContext = getGameContext();
	const game = gameContext.game as MultiplayerGame;
	const user = page.data.user as UserPublicProfile;

	function onMessage(event: MessageEvent<string>) {
		let data: MultiplayerInputMessage;

		try {
			data = JSON.parse(event.data);
		} catch {
			toast.error(m.dry_teary_macaw_hurl(), {
				description: "Couldn't parse message from server"
			});

			return;
		}

		switch (data.type) {
			case 'error': {
				gameContext.guessPending = false;
				toast.error(m.dry_teary_macaw_hurl(), {
					description: data.payload.message
				});

				break;
			}
			case 'usersConnected': {
				isAdmitted = true;
				const currentUser = data.payload.users.find((participant) => participant.id === user.id);
				if (currentUser) {
					if (currentUser.guessed && gameContext.guessPending) gameContext.recordGuess();
					gameContext.userGuessed = currentUser.guessed;
				}
				gameContext.guessPending = false;
				gameUsers?.handleUsersConnected(data.payload.users);

				break;
			}
			case 'userConnected': {
				gameUsers?.handleUserConnected(data.payload.user);

				break;
			}
			case 'userDisconnected': {
				gameUsers?.handleUserDisconnected(data.payload.username);

				break;
			}
			case 'userGuessed': {
				if (data.payload.username === user.username) {
					if (gameContext.guessPending) gameContext.recordGuess();
					gameContext.userGuessed = true;
					gameContext.guessPending = false;
				}
				gameUsers?.handleUserGuessed(data.payload.username);

				break;
			}
			case 'roundFinished': {
				gameOverlay?.endRound(data.payload.guesses);

				break;
			}
		}
	}

	function onClose() {
		isAdmitted = false;
		gameContext.guessPending = false;
	}

	export function sendGuess(coords: LatLng | null) {
		if (!isAdmitted) return false;

		const wsMsg = {
			type: 'userGuess',
			payload: {
				guess: coords
			}
		} as UserGuessMessage;

		return ws?.sendMessage(wsMsg) ?? false;
	}

	export function sendEndRound() {
		const wsMsg = {
			type: 'endRound'
		} as RoundEndMessage;

		ws?.sendMessage(wsMsg);
	}
</script>

<WebSocketClient
	bind:this={ws}
	connURL={getMultiplayerWebSocketURL(game.id, jwt)}
	{onMessage}
	{onClose}
></WebSocketClient>
