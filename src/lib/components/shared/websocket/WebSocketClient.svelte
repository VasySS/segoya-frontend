<script lang="ts">
	import { m } from '#paraglide/messages.js';
	import { onDestroy, onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	import type { WebSocketOutputMessage } from './types';

	interface Props {
		connURL: string;
		onMessage: (event: MessageEvent) => void;
		onOpen?: () => void;
		onClose?: (event: CloseEvent) => void;
	}
	let { connURL, onMessage, onOpen, onClose }: Props = $props();

	let socket: WebSocket | undefined;

	let reconnectAttempts = 1;
	let maxReconnectAttempts = 3;
	let reconnectTimeout: ReturnType<typeof setTimeout> | undefined;

	const wsStatus = {
		NORMAL_CLOSE: 1000,
		GOING_AWAY: 1001,
		NO_STATUS: 1005
	} as const;

	onMount(() => {
		connect();
	});

	onDestroy(() => {
		if (reconnectTimeout) clearTimeout(reconnectTimeout);
		socket?.close(1000, 'client closed the connection');
	});

	function connect() {
		socket = new WebSocket(connURL);

		socket.addEventListener('open', () => {
			reconnectAttempts = 0;
			toast.success(m.knotty_main_lion_bubble());
			onOpen?.();
		});

		socket.addEventListener('message', onMessage);

		socket.addEventListener('close', (event) => {
			onClose?.(event);

			const expectedCloseCodes: number[] = [
				wsStatus.NORMAL_CLOSE,
				wsStatus.GOING_AWAY,
				wsStatus.NO_STATUS
			];
			if (expectedCloseCodes.includes(event.code)) {
				return;
			}

			toast.error(m.dry_teary_macaw_hurl(), {
				description: `${m.heroic_aware_shrike_scoop()} ${reconnectAttempts.toString()}/${maxReconnectAttempts.toString()}`
			});

			scheduleReconnect();
		});

		socket.addEventListener('error', () => {
			toast.error(m.dry_teary_macaw_hurl(), {});
		});
	}

	function scheduleReconnect() {
		if (reconnectAttempts >= maxReconnectAttempts) return;

		const delay = 2000 * reconnectAttempts;
		reconnectAttempts++;

		if (reconnectTimeout) clearTimeout(reconnectTimeout);
		reconnectTimeout = setTimeout(() => {
			connect();
		}, delay);
	}

	// eslint-disable-next-line unicorn/consistent-boolean-name
	export function sendMessage(message: WebSocketOutputMessage): boolean {
		if (socket?.readyState !== WebSocket.OPEN) return false;

		try {
			socket.send(JSON.stringify(message));
			return true;
		} catch {
			return false;
		}
	}
</script>
