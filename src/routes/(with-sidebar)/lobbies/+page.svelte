<script lang="ts">
	import { fetchBackend } from '#lib/api/base.js';
	import type { Lobby } from '#lib/api/openapi.js';
	import { m } from '#paraglide/messages.js';
	import { resolve } from '$app/paths';
	import { toast } from 'svelte-sonner';
	import Button from '#components/shadcn/button/button.svelte';
	import DataTable from '#components/shadcn/data-table/data-table.svelte';

	import type { PageData } from './$types';
	import { columns } from './tableColumns';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();

	// svelte-ignore state_referenced_locally
	const lobbiesInfo = data.lobbies;

	async function getPageData(
		page: number,
		pageSize: number
	): Promise<{ data: Lobby[]; total: number }> {
		const lobbiesResponse = await fetchBackend(data.jwtToken, 'get', '/v1/lobbies', {
			query: {
				page: page,
				'page-size': pageSize
			}
		});

		if (!lobbiesResponse.success) {
			toast.error(lobbiesResponse.error.detail);
			return { data: [], total: 0 };
		}

		return {
			data: lobbiesResponse.data.lobbies,
			total: lobbiesResponse.data.total
		};
	}
</script>

<svelte:head>
	<title>Segoya &mdash; {m.lobbiesList()}</title>
</svelte:head>

<h1 class="mb-12 text-center">{m.lobbiesList()}</h1>

<div class="flex flex-row">
	<Button
		class="mb-3 w-44"
		href={resolve('/(with-sidebar)/lobbies/new')}
	>
		{m.createLobby()}
	</Button>

	<div class="flex-1"></div>
</div>

<div class="bg-card rounded-sm p-2">
	<DataTable
		data={lobbiesInfo.lobbies}
		dataTotal={lobbiesInfo.total}
		{columns}
		{getPageData}
	/>
</div>
