<script lang="ts">
	import * as Tabs from '$components/shadcn/tabs/index';
	import { fetchBackend } from '$lib/api/base';
	import type { SingleplayerGames } from '$lib/api/openapi';
	import { m } from '$paraglide/messages.js';
	import { toast } from 'svelte-sonner';

	import AccountTab from './(components)/(account-tab)/AccountTab.svelte';
	import SecurityTab from './(components)/(security-tab)/SecurityTab.svelte';
	import StatisticsTab from './(components)/(statistics-tab)/StatisticsTab.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();

	let singleplayerGames = $state<SingleplayerGames>();
	// svelte-ignore state_referenced_locally
	const sessions = data.sessions;
	// svelte-ignore state_referenced_locally
	const connectedOAuth = data.connectedOAuth;
	// svelte-ignore state_referenced_locally
	const jwtPayload = data.jwtPayload;
	// svelte-ignore state_referenced_locally
	const jwtToken = data.jwtToken;
</script>

<svelte:head>
	<title>Segoya &mdash; {m.profileHeader()}</title>
</svelte:head>

<h1 class="mb-12 text-center">{m.profileHeader()}</h1>

<Tabs.Root value="account">
	<Tabs.List class="grid h-32 w-full sm:h-10 sm:grid-cols-3">
		<Tabs.Trigger
			class="w-80 sm:w-full"
			value="account"
		>
			{m.profileTabAccount()}
		</Tabs.Trigger>

		<Tabs.Trigger value="security">
			{m.such_every_lion_adapt()}
		</Tabs.Trigger>

		<Tabs.Trigger
			value="statistics"
			onclick={async () => {
				const gamesResponse = await fetchBackend(jwtToken, 'get', '/v1/singleplayer', {
					query: {
						page: 1,
						'page-size': 10
					}
				});

				if (!gamesResponse.success) {
					singleplayerGames = undefined;
					toast.error(gamesResponse.error.detail);

					return;
				}

				singleplayerGames = gamesResponse.data;
			}}
		>
			{m.profileTabStats()}
		</Tabs.Trigger>
	</Tabs.List>

	<Tabs.Content value="account">
		<AccountTab
			avatarForm={data.avatarForm}
			userForm={data.form}
			userInfo={data.profileInfo}
		></AccountTab>
	</Tabs.Content>

	<Tabs.Content value="security">
		<SecurityTab
			{connectedOAuth}
			{jwtPayload}
			jwtToken={data.jwtToken}
			{sessions}
			apiKeys={data.apiKeys}
		></SecurityTab>
	</Tabs.Content>

	<Tabs.Content value="statistics">
		<StatisticsTab
			jwtToken={data.jwtToken}
			gamesResponse={singleplayerGames}
		></StatisticsTab>
	</Tabs.Content>
</Tabs.Root>

<!-- <SuperDebug data={$formData} /> -->
