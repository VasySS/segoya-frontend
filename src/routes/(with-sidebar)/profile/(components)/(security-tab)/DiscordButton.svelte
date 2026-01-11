<script lang="ts">
	import { asset } from '$app/paths';
	import Button from '$components/shadcn/button/button.svelte';
	import { fetchBackend } from '$lib/api/base';
	import { m } from '$paraglide/messages.js';

	interface Props {
		oauthCreatedAt?: string | undefined;
		jwtToken: string;
	}
	let { oauthCreatedAt, jwtToken }: Props = $props();

	async function handleDiscordRemove() {
		await fetchBackend(jwtToken, 'delete', '/v1/auth/discord');

		globalThis.location.reload();
	}
</script>

<div class="flex w-full flex-row items-center justify-center space-x-2">
	<img
		src={asset('/logos/discord-logo.svg')}
		class="size-7"
		alt="discord logo"
	/>

	<p class="text-base font-bold">Discord</p>

	{#if oauthCreatedAt}
		<p>({new Date(oauthCreatedAt).toLocaleDateString()})</p>
	{/if}

	{#if oauthCreatedAt}
		<Button
			class="w-full"
			onclick={handleDiscordRemove}
		>
			<p>{m.super_each_bison_find()}</p>
		</Button>
	{:else}
		<form
			method="POST"
			aria-label="discord-add"
		>
			<Button
				class="w-full"
				type="submit"
				formaction="?/add_discord"
			>
				<p>{m.bald_still_lemming_hunt()}</p>
			</Button>
		</form>
	{/if}
</div>
