<script lang="ts">
	import { SendHorizontal } from '@lucide/svelte';
	import { Button } from '$components/shadcn/button/index';
	import { Input } from '$components/shadcn/input/index';
	import { m } from '$paraglide/messages.js';
	import { tick, untrack } from 'svelte';
	import { fade } from 'svelte/transition';

	import LobbyWebSocket from './LobbyWebSocket.svelte';
	import type { ChatMessageContent } from './websocket';

	interface Props {
		lobbyWS: LobbyWebSocket | undefined;
		username: string;
	}
	let { lobbyWS, username }: Props = $props();

	let chatMessages = $state<ChatMessageContent[]>([]);
	let userInput = $state<string>('');

	let scrollContainer = $state<HTMLDivElement>();
	let isUserScrolling = $state(false);

	// how far from the bottom user has to scroll to stop auto scroll
	const SCROLL_THRESHOLD = 50;

	const scrollToBottom = async (node: HTMLDivElement) => {
		await tick();

		requestAnimationFrame(() => {
			if (typeof node.scrollTo === 'function') {
				node.scrollTo({
					top: node.scrollHeight,
					behavior: 'smooth'
				});
			} else {
				node.scrollTop = node.scrollHeight;
			}
		});
	};

	$effect(() => {
		// Track chatMessages to trigger on new messages
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const messages = chatMessages;

		// Don't track isUserScrolling to avoid circular updates
		untrack(() => {
			if (scrollContainer && !isUserScrolling) {
				void scrollToBottom(scrollContainer);
			}
		});
	});

	function handleMessageSend() {
		if (userInput.trim() === '') return;

		lobbyWS?.sendChatMessage(username, userInput);
		userInput = '';
	}

	export const addMessage = (msg: ChatMessageContent) => {
		// chatMessages.push(...) is not triggering the $effect.pre
		chatMessages = [...chatMessages, msg];
	};
</script>

<div
	bind:this={scrollContainer}
	class="bg-card my-2 h-52 overflow-scroll overflow-x-hidden rounded-sm border p-4"
	onscroll={() => {
		if (!scrollContainer) return;

		const position = scrollContainer.scrollTop + scrollContainer.clientHeight;
		const height = scrollContainer.scrollHeight;

		isUserScrolling = position < height - SCROLL_THRESHOLD;
	}}
>
	{#each chatMessages as msg, index (msg.time + '-' + String(index))}
		<p
			in:fade
			class="mt-2 wrap-break-word whitespace-normal"
		>
			[{new Date(msg.time).toLocaleTimeString()}] {msg.username}: {msg.text}
		</p>
	{/each}
</div>

<div class="mb-1 flex flex-row gap-2">
	<Input
		bind:value={userInput}
		class="h-full"
		placeholder={m.hour_cool_rat_scold()}
		onkeypress={(e: KeyboardEvent) => {
			if (e.key === 'Enter') {
				handleMessageSend();
			}
		}}
		disabled={!lobbyWS}
	/>

	<Button
		class="h-full"
		onclick={handleMessageSend}
		title={m.bald_loved_millipede_chop()}
	>
		<SendHorizontal></SendHorizontal>
	</Button>
</div>
