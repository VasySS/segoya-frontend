import type { ColumnDef } from '@tanstack/table-core';
import { resolve } from '$app/paths';
import { renderSnippet } from '$components/shadcn/data-table/index';
import type { Lobby } from '$lib/api/openapi';
import { getProviderLabel } from '$lib/constants/panoramaProviders';
import { formatTimerTime } from '$lib/utils/formatters';
import { m } from '$paraglide/messages.js';
import { createRawSnippet } from 'svelte';

export const columns: ColumnDef<Lobby>[] = [
	{
		accessorKey: 'id',
		header: 'ID',
		cell: ({ row }) => {
			const id = row.original.id;

			const joinSnippet = createRawSnippet<[string]>(() => {
				return {
					render: () => `
						<a
							class="hover:underline"
							href="${resolve('/(with-sidebar)/lobbies/[id]', { id })}"
						>
							${id}
						</button>
					`
				};
			});

			return renderSnippet(joinSnippet);
		}
	},
	// {
	// 	accessorFn: (row) => new Date(row.createdAt).toLocaleString(),
	// 	header: m.profileGameDate()
	// },
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
];
