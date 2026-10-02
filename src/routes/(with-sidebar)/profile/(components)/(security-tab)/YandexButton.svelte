<script lang="ts">
	import { fetchBackend } from '#lib/api/base.js';
	import { formatDate } from '#lib/utils/temporal.js';
	import { m } from '#paraglide/messages.js';
	import { refreshAll } from '$app/navigation';
	import { asset } from '$app/paths';
	import { toast } from 'svelte-sonner';
	import Button from '#components/shadcn/button/button.svelte';

	interface Props {
		oauthCreatedAt?: string | undefined;
		jwtToken: string;
	}
	let { oauthCreatedAt, jwtToken }: Props = $props();

	async function handleYandexRemove() {
		const response = await fetchBackend(jwtToken, 'delete', '/v1/auth/yandex');
		if (!response.success) {
			toast.error(response.error.detail);
			return;
		}
		await refreshAll();
	}
</script>

<div class="flex w-full flex-row items-center justify-center space-x-3">
	<img
		src={asset('logos/ya-logo.svg')}
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
