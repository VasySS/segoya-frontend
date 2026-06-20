<script lang="ts">
	import { asset } from '$app/paths';
	import Button from '$components/shadcn/button/button.svelte';
	import { fetchBackend } from '$lib/api/base';
	import { formatDate } from '$lib/utils/temporal';
	import { m } from '$paraglide/messages.js';

	interface Props {
		oauthCreatedAt?: string | undefined;
		jwtToken: string;
	}
	let { oauthCreatedAt, jwtToken }: Props = $props();

	async function handleYandexRemove() {
		await fetchBackend(jwtToken, 'delete', '/v1/auth/yandex');

		location.reload();
	}
</script>

<div class="flex w-full flex-row items-center justify-center space-x-3">
	<img
		src={asset('/logos/ya-logo.svg')}
		class="size-7"
		alt="yandex logo"
	/>
	<p class="text-base font-bold">{m.flaky_merry_dog_nurture()}</p>

	{#if oauthCreatedAt}
		<p>({formatDate(oauthCreatedAt)})</p>
	{/if}

	{#if oauthCreatedAt}
		<Button
			class="w-full"
			onclick={handleYandexRemove}
		>
			<p>{m.super_each_bison_find()}</p>
		</Button>
	{:else}
		<form
			method="POST"
			aria-label="yandex-add"
		>
			<Button
				class="w-full"
				type="submit"
				formaction="?/add_yandex"
			>
				<p>{m.bald_still_lemming_hunt()}</p>
			</Button>
		</form>
	{/if}
</div>
