<script
	lang="ts"
	generics="TData, TValue"
>
	import { LoaderCircle } from '@lucide/svelte';
	import {
		getCoreRowModel,
		getFilteredRowModel,
		type ColumnDef,
		type PaginationState,
		type SortingState
	} from '@tanstack/table-core';
	import { createSvelteTable, FlexRender } from '$components/shadcn/data-table/index.js';
	import * as Table from '$components/shadcn/table/index.js';
	import { m } from '$paraglide/messages';

	import Pagination from './data-table-pagination.svelte';
	import Toolbar from './data-table-toolbar.svelte';

	type DataTableProps<TData, TValue> = {
		data: TData[];
		dataTotal: number;
		columns: ColumnDef<TData, TValue>[];
		pageSize?: number;
		getPageData: (page: number, pageSize: number) => Promise<{ data: TData[]; total: number }>;
	};
	let {
		data,
		dataTotal,
		columns,
		pageSize = 10,
		getPageData
	}: DataTableProps<TData, TValue> = $props();

	let sortingState = $state<SortingState>([]);
	let globalFilter = $state<string>('');

	// svelte-ignore state_referenced_locally
	let paginationState = $state<PaginationState>({ pageIndex: 0, pageSize: pageSize });
	let paginationLoading = $state<boolean>(false);

	const toolbarRefreshCallback = async () => {
		paginationLoading = true;
		const nextPage = await getPageData(paginationState.pageIndex + 1, paginationState.pageSize);

		data = nextPage.data;
		dataTotal = nextPage.total;
		paginationLoading = false;
	};

	const table = createSvelteTable({
		get data() {
			return data;
		},
		get rowCount() {
			return dataTotal;
		},
		// svelte-ignore state_referenced_locally
		columns,
		// pagination
		manualPagination: true,
		getCoreRowModel: getCoreRowModel(),
		onPaginationChange: (updater) => {
			const next = typeof updater === 'function' ? updater(paginationState) : updater;
			paginationState = next;

			paginationLoading = true;
			getPageData(next.pageIndex + 1, next.pageSize).then((nextPage) => {
				data = nextPage.data;
				dataTotal = nextPage.total;
				paginationLoading = false;
			});
		},
		// filtering
		getFilteredRowModel: getFilteredRowModel(),
		onGlobalFilterChange: (updater) => {
			if (typeof updater === 'function') {
				globalFilter = updater(globalFilter);
			} else {
				globalFilter = updater;
			}
		},
		state: {
			get pagination() {
				return paginationState;
			},
			get sorting() {
				return sortingState;
			},
			get globalFilter() {
				return globalFilter;
			}
		}
	});
</script>

<div>
	<Toolbar
		bind:globalFilter
		{toolbarRefreshCallback}
	></Toolbar>

	<div class="mt-2 rounded-sm border">
		<Table.Root class="h-[47rem]">
			<Table.Header>
				{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
					<Table.Row>
						{#each headerGroup.headers as header (header.id)}
							<Table.Head>
								{#if !header.isPlaceholder}
									<FlexRender
										content={header.column.columnDef.header!}
										context={header.getContext()}
									/>
								{/if}
							</Table.Head>
						{/each}
					</Table.Row>
				{/each}
			</Table.Header>

			<Table.Body>
				{#if paginationLoading}
					<!-- Loading spinner when user is paginating -->
					<tr>
						<td colspan={columns.length}>
							<div class="flex h-40 items-center justify-center">
								<LoaderCircle class="size-20 animate-spin" />
							</div>
						</td>
					</tr>
				{:else if table.getRowModel().rows.length === 0}
					<!-- Show a message when there are no results -->
					<tr>
						<td colspan={columns.length}>
							<div class="text-muted-foreground flex h-40 items-center justify-center">
								{m.patchy_maroon_parrot_propel()}
							</div>
						</td>
					</tr>
				{:else}
					{#each table.getRowModel().rows as row (row.id)}
						<Table.Row data-state={row.getIsSelected() && 'selected'}>
							{#each row.getAllCells() as cell (cell.id)}
								<Table.Cell>
									<FlexRender
										content={cell.column.columnDef.cell!}
										context={cell.getContext()}
									/>
								</Table.Cell>
							{/each}
						</Table.Row>
					{/each}

					<!-- Add empty rows to handle table shifts -->
					{@const rowsLength = table.getRowModel().rows.length}
					{#if rowsLength < pageSize}
						{#each Array(pageSize - rowsLength).fill(0) as _, i}
							<Table.Row>
								{#each columns}
									<Table.Cell>&zwnj;</Table.Cell>
								{/each}
							</Table.Row>
						{/each}
					{/if}
				{/if}
			</Table.Body>
		</Table.Root>
	</div>

	<Pagination
		{table}
		{paginationState}
	></Pagination>
</div>
