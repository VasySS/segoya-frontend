<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import WebSocketClient from '$components/shared/websocket/WebSocketClient.svelte';
	import type { Lobby } from '$lib/api/openapi';
	import { getLobbyWebSocketURL } from '$lib/api/websocket';
	import { m } from '$paraglide/messages.js';
	import { toast } from 'svelte-sonner';

	import LobbyChat from './LobbyChat.svelte';
	import LobbySettings from './LobbySettings.svelte';
	import LobbyPlayers from './LobbyUsers.svelte';
	import type {
		ChatMessageToBackend,
		GameStartMessage,
		LobbyInputMessage,
		LobbyNewSettingsMessage,
		LobbySettingsContent
	} from './websocket';

	interface Props {
		lobbyUsers: LobbyPlayers | undefined;
		lobbyChat: LobbyChat | undefined;
		lobbySettings: LobbySettings | undefined;
	}
	let { lobbyUsers, lobbyChat, lobbySettings }: Props = $props();

	let ws = $state<WebSocketClient>();

	const jwt = page.data.jwtToken as string;
	const lobby = page.data.lobby as Lobby;

	function onMessage(event: MessageEvent<string>) {
		let data = JSON.parse(event.data) as LobbyInputMessage;

		switch (data.type) {
			case 'error': {
				toast.error(m.dry_teary_macaw_hurl(), {
					description: data.payload.message
				});

				break;
			}
			case 'connectedUsers': {
				lobbyUsers?.updateUsers(data.payload.users);

				break;
			}
			case 'userConnected': {
				lobbyUsers?.addUser(data.payload.user);

				break;
			}
			case 'userDisconnected': {
				lobbyUsers?.deleteUser(data.payload.username);

				break;
			}
			case 'gameRedirect': {
				globalThis.location.href = resolve('/(game)/multiplayer/[id]', { id: data.payload.gameID });

				break;
			}
			case 'chatOutput': {
				lobbyChat?.addMessage(data.payload.message);

				break;
			}

			case 'settingsChanged': {
				lobbySettings?.updateSettings(data.payload.settings);

				break;
			}
		}
	}

	export function sendGameStartMessage() {
		const wsMsg = {
			type: 'gameStart'
		} as GameStartMessage;

		ws?.sendMessage(wsMsg);
	}

	export function sendChatMessage(username: string, message: string) {
		const wsMsg = {
			type: 'chatInput',
			payload: {
				message: {
					username: username,
					text: message
				}
			}
		} as ChatMessageToBackend;

		ws?.sendMessage(wsMsg);
	}

	export function sendSettingsMessage(settings: LobbySettingsContent) {
		const wsMsg = {
			type: 'settingsNew',
			payload: {
				settings: settings
			}
		} as LobbyNewSettingsMessage;

		ws?.sendMessage(wsMsg);
	}
</script>

<WebSocketClient
	bind:this={ws}
	connURL={getLobbyWebSocketURL(lobby.id, jwt)}
	{onMessage}
></WebSocketClient>
