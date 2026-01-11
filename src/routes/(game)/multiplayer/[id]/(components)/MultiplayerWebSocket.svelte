<script lang="ts">
	import { page } from '$app/state';
	import WebSocketClient from '$components/shared/websocket/WebSocketClient.svelte';
	import type { LatLng, MultiplayerGame } from '$lib/api/openapi';
	import { getMultiplayerWebSocketURL } from '$lib/api/websocket';
	import { getGameContext } from '$lib/states/gameContext.svelte';
	import { m } from '$paraglide/messages.js';
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

	const jwt = page.data.jwtToken as string;

	const gameContext = getGameContext();
	const game = gameContext.game as MultiplayerGame;

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
				toast.error(m.dry_teary_macaw_hurl(), {
					description: data.payload.message
				});

				break;
			}
			case 'usersConnected': {
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
				gameUsers?.handleUserGuessed(data.payload.username);

				break;
			}
			case 'roundFinished': {
				gameOverlay?.endRound(data.payload.guesses);

				break;
			}
		}
	}

	export function sendGuess(coords: LatLng) {
		const wsMsg = {
			type: 'userGuess',
			payload: {
				guess: {
					lat: coords.lat,
					lng: coords.lng
				}
			}
		} as UserGuessMessage;

		ws?.sendMessage(wsMsg);
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
></WebSocketClient>
