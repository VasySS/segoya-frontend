<script lang="ts">
	import { fetchBackend } from '#lib/api/base.js';
	import type { SingleplayerGames } from '#lib/api/openapi.js';
	import { m } from '#paraglide/messages.js';
	import { toast } from 'svelte-sonner';
	import * as Tabs from '#components/shadcn/tabs/index.js';

	import AccountTab from './(components)/(account-tab)/AccountTab.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();

	let singleplayerGames = $state<SingleplayerGames>();
	let activeTab = $state('account');

	async function loadStatistics() {
		const gamesResponse = await fetchBackend(data.jwtToken, 'get', '/v1/singleplayer', {
			query: { page: 1, 'page-size': 10 }
		});
		if (!gamesResponse.success) {
			singleplayerGames = undefined;
			toast.error(gamesResponse.error.detail);
			return;
		}
		singleplayerGames = gamesResponse.data;
	}
</script>

<svelte:head>
	<title>Segoya &mdash; {m.profileHeader()}</title>
</svelte:head>

<h1 class="mb-12 text-center">{m.profileHeader()}</h1>

<Tabs.Root
	bind:value={activeTab}
	onValueChange={(value) => {
		if (value === 'statistics') void loadStatistics();
	}}
>
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

		<Tabs.Trigger value="statistics">
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
		{#if activeTab === 'security'}
			{#await import('./(components)/(security-tab)/SecurityTab.svelte')}
				<p role="status">{m.loading()}</p>
			{:then { default: SecurityTab }}
				<SecurityTab
					connectedOAuth={data.connectedOAuth}
					jwtPayload={data.jwtPayload}
					jwtToken={data.jwtToken}
					sessions={data.sessions}
					apiKeys={data.apiKeys}
				/>
			{:catch}
				<p role="alert">{m.errorGetting()}</p>
			{/await}
		{/if}
	</Tabs.Content>

	<Tabs.Content value="statistics">
		{#if activeTab === 'statistics'}
			{#await import('./(components)/(statistics-tab)/StatisticsTab.svelte')}
				<p role="status">{m.loading()}</p>
			{:then { default: StatisticsTab }}
				<StatisticsTab
					jwtToken={data.jwtToken}
					gamesResponse={singleplayerGames}
				/>
			{:catch}
				<p role="alert">{m.errorGetting()}</p>
			{/await}
		{/if}
	</Tabs.Content>
</Tabs.Root>

<!-- <SuperDebug data={$formData} /> -->
