<script
	lang="ts"
	generics="TData"
>
	import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from '@lucide/svelte';
	import type { PaginationState, Table } from '@tanstack/table-core';
	import Button from '$components/shadcn/button/button.svelte';
	import { m } from '$paraglide/messages';

	interface Props {
		table: Table<TData>;
		paginationState: PaginationState;
	}
	let { table, paginationState }: Props = $props();
</script>

<div class="flex items-center justify-end space-x-2 py-4">
	<Button
		title={m.misty_heavy_reindeer_aim()}
		variant="outline"
		size="sm"
		onclick={() => table.setPageIndex(0)}
		disabled={!table.getCanPreviousPage()}
	>
		<ChevronsLeft></ChevronsLeft>
	</Button>

	<Button
		title={m.fine_polite_ox_slurp()}
		variant="outline"
		size="sm"
		onclick={() => table.previousPage()}
		disabled={!table.getCanPreviousPage()}
	>
		<ChevronLeft />
	</Button>

	{#if table.getPageCount() > 0}
		<p>{paginationState.pageIndex + 1}/{table.getPageCount()}</p>
	{/if}

	<Button
		title={m.weird_same_poodle_quell()}
		variant="outline"
		size="sm"
		onclick={() => table.nextPage()}
		disabled={!table.getCanNextPage()}
	>
		<ChevronRight />
	</Button>

	<Button
		title={m.witty_yummy_nuthatch_bless()}
		variant="outline"
		size="sm"
		onclick={() => table.setPageIndex(table.getPageCount() - 1)}
		disabled={!table.getCanNextPage()}
	>
		<ChevronsRight />
	</Button>
</div>
