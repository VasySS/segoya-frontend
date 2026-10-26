<script lang="ts">
	import { fetchBackend } from '#lib/api/base.js';
	import type { Lobby } from '#lib/api/openapi.js';
	import { getLobbyWebSocketURL } from '#lib/api/websocket.js';
	import { m } from '#paraglide/messages.js';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { toast } from 'svelte-sonner';
	import WebSocketClient from '#components/shared/websocket/WebSocketClient.svelte';

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
		connected?: boolean;
		onError?: () => void;
	}
	let {
		lobbyUsers,
		lobbyChat,
		lobbySettings,
		connected = $bindable(false),
		onError
	}: Props = $props();

	let ws = $state<WebSocketClient>();

	const jwt = page.data.jwtToken as string;
	const lobby = page.data.lobby as Lobby;

	function onMessage(event: MessageEvent<string>) {
		let data = JSON.parse(event.data) as LobbyInputMessage;

		switch (data.type) {
			case 'error': {
				lobbySettings?.failPending(data.payload.message);
				onError?.();
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
				location.assign(resolve('/(game)/multiplayer/[id]', { id: data.payload.gameID }));

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

	// eslint-disable-next-line unicorn/consistent-boolean-name -- Transport API reports whether the send succeeded.
	export function sendGameStartMessage() {
		const wsMsg = {
			type: 'gameStart'
		} as GameStartMessage;

		return connected && Boolean(ws?.sendMessage(wsMsg));
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

	// eslint-disable-next-line unicorn/consistent-boolean-name -- Transport API reports whether the send succeeded.
	export function sendSettingsMessage(settings: LobbySettingsContent) {
		const wsMsg = {
			type: 'settingsNew',
			payload: {
				settings: settings
			}
		} as LobbyNewSettingsMessage;

		return connected && Boolean(ws?.sendMessage(wsMsg));
	}

	export async function syncSettings() {
		connected = false;
		try {
			const response = await fetchBackend(jwt, 'get', '/v1/lobbies/{id}', {
				path: { id: lobby.id }
			});
			if (response.success) {
				lobbySettings?.updateSettings(response.data);
				connected = true;
			}
		} catch {
			connected = false;
		}
	}
</script>

<WebSocketClient
	bind:this={ws}
	connURL={getLobbyWebSocketURL(lobby.id, jwt)}
	{onMessage}
	onOpen={() => {
		void syncSettings();
	}}
	onClose={() => {
		connected = false;
		lobbySettings?.failPending(m.areaDisconnected());
		onError?.();
	}}
></WebSocketClient>
