import { createColumnHelper } from '@tanstack/svelte-table';
import type { Lobby } from '#lib/api/openapi.js';
import type { DataTableFeatures } from '#lib/components/shadcn/data-table/data-table-features.ts';
import { getProviderLabel } from '#lib/constants/panoramaProviders.js';
import { formatTimerTime } from '#lib/utils/formatters.js';
import { m } from '#paraglide/messages.js';
import { resolve } from '$app/paths';
import { createRawSnippet } from 'svelte';
import { renderSnippet } from '#components/shadcn/data-table/index.js';

const columnHelper = createColumnHelper<DataTableFeatures, Lobby>();

export const columns = columnHelper.columns([
	{
		accessorKey: 'id',
		header: 'ID',
		cell: ({ row }) => {
			const id = row.original.id;

			const joinSnippet = createRawSnippet(() => {
				return {
					render: () => `
						<a
							class="hover:underline"
							href="${resolve('/(with-sidebar)/lobbies/[id]', { id })}"
						>
							${id}
						</a>
					`
				};
			});

			return renderSnippet(joinSnippet);
		}
	},
	{
		accessorFn: (row) => `${row.currentPlayers.toString()}/${row.maxPlayers.toString()}`,
		header: 'Игроки'
	},
	{
		accessorFn: (row) => getProviderLabel(row.provider),
		header: m.alive_red_tuna_walk()
	},
	{
		accessorFn: (row) => row.rounds,
		header: m.totalRounds()
	},
	{
		accessorKey: 'timerSeconds',
		header: m.strong_wild_iguana_sway(),
		cell: ({ row }) => {
			if (row.original.timerSeconds === 0) {
				return m.disabled();
			}

			return formatTimerTime(row.original.timerSeconds);
		}
	}
]);
