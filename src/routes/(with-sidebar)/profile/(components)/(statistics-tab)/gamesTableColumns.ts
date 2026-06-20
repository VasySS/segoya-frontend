import type { ColumnDef } from '@tanstack/table-core';
import { resolve } from '$app/paths';
import { renderSnippet } from '$components/shadcn/data-table/index';
import type { SingleplayerGame } from '$lib/api/openapi';
import { getProviderLabel } from '$lib/constants/panoramaProviders';
import { formatDateTime } from '$lib/utils/temporal';
import { m } from '$paraglide/messages.js';
import { createRawSnippet } from 'svelte';

export const columns: ColumnDef<SingleplayerGame>[] = [
	{
		accessorFn: (row) => formatDateTime(row.createdAt),
		header: m.profileGameDate()
	},
	{
		accessorFn: (row) => getProviderLabel(row.provider),
		header: m.alive_red_tuna_walk()
	},
	{
		accessorKey: 'timerSeconds',
		header: m.strong_wild_iguana_sway(),
		cell: ({ row }) => {
			const seconds = row.original.timerSeconds;
			if (seconds === 0) {
				return '-';
			}

			return seconds;
		}
	},
	{
		accessorKey: 'rounds',
		header: m.totalRounds()
	},
	{
		accessorKey: 'score',
		header: m.major_front_stingray_agree()
	},
	{
		accessorKey: 'finished',
		header: '',
		cell: ({ row }) => {
			const isFinished = row.original.finished;
			const gameID = row.original.id;

			const continueButtonSnippet = createRawSnippet(() => {
				return {
					render: () => `
						<a 
							class="button border text-foreground bg-primary hover:bg-accent rounded-sm p-2"
							href="${resolve('/(game)/singleplayer/[id]', { id: gameID })}"
						>
							${m.continueGame()}
						</a>`
				};
			});

			if (!isFinished) {
				return renderSnippet(continueButtonSnippet);
			}

			return '';
		}
	}
];
