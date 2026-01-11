<script lang="ts">
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import * as Card from '$components/shadcn/card/index';
	import DataTable from '$components/shadcn/data-table/data-table.svelte';
	import { fetchBackend } from '$lib/api/base';
	import type { SingleplayerGames } from '$lib/api/openapi';
	import { m } from '$paraglide/messages.js';
	import { toast } from 'svelte-sonner';

	import { columns } from './gamesTableColumns';

	interface Props {
		jwtToken: string;
		gamesResponse: SingleplayerGames | undefined;
	}
	let { jwtToken, gamesResponse }: Props = $props();

	async function getPageData(page: number, pageSize: number) {
		const nextPageGames = await fetchBackend(jwtToken, 'get', '/v1/singleplayer', {
			query: {
				page: page,
				'page-size': pageSize
			}
		});

		if (!nextPageGames.success) {
			toast.error(nextPageGames.error.detail);
			return { data: [], total: 0 };
		}

		return {
			data: nextPageGames.data.games,
			total: nextPageGames.data.total
		};
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>{m.playedGames()}</Card.Title>
		<Card.Description></Card.Description>
	</Card.Header>

	<Card.Content>
		{#if gamesResponse}
			<DataTable
				data={gamesResponse.games}
				dataTotal={gamesResponse.total}
				{columns}
				{getPageData}
			/>
		{:else}
			<div class="flex items-center justify-center">
				<LoaderCircle
					role="img"
					class="size-20 animate-spin"
				/>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
