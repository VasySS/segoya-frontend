import { createColumnHelper } from '@tanstack/svelte-table';
import { screen, waitFor } from '@testing-library/svelte';
import { m } from '#paraglide/messages.js';
import { setupComponent } from '#tests/vitestSetup.js';
import { describe, expect, it, vi } from 'vitest';

import type { DataTableFeatures } from './data-table-features';
import DataTable from './data-table.svelte';

const helper = createColumnHelper<DataTableFeatures, { name: string }>();
const columns = helper.columns([{ accessorKey: 'name', header: 'Name' }]);

describe('server-paginated table', () => {
	it('renders server data and fetches next and previous pages', async () => {
		expect.hasAssertions();
		const getPageData = vi
			.fn<
				(page: number, pageSize: number) => Promise<{ data: { name: string }[]; total: number }>
			>()
			.mockResolvedValueOnce({ data: [{ name: 'Second page' }], total: 5 })
			.mockResolvedValueOnce({ data: [{ name: 'First page' }], total: 5 });
		const { user } = setupComponent(DataTable, {
			props: {
				data: [{ name: 'First page' }],
				dataTotal: 5,
				columns,
				pageSize: 2,
				getPageData
			}
		});
		expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
		expect(screen.getByTitle(m.fine_polite_ox_slurp())).toBeDisabled();
		await user.click(screen.getByTitle(m.weird_same_poodle_quell()));
		await screen.findByText('Second page');
		expect(getPageData).toHaveBeenLastCalledWith(2, 2);
		expect(screen.getByText('2/3')).toBeInTheDocument();
		await user.click(screen.getByTitle(m.fine_polite_ox_slurp()));
		await screen.findByText('First page');
		expect(getPageData).toHaveBeenLastCalledWith(1, 2);
	});

	it('supports last-page navigation, refresh and first-page navigation', async () => {
		expect.hasAssertions();
		const getPageData = vi
			.fn<
				(page: number, pageSize: number) => Promise<{ data: { name: string }[]; total: number }>
			>()
			.mockResolvedValue({ data: [{ name: 'Updated' }], total: 5 });
		const { user } = setupComponent(DataTable, {
			props: {
				data: [{ name: 'Initial' }],
				dataTotal: 5,
				columns,
				pageSize: 2,
				getPageData
			}
		});
		await user.click(screen.getByTitle(m.witty_yummy_nuthatch_bless()));
		await screen.findByText('Updated');
		expect(getPageData).toHaveBeenLastCalledWith(3, 2);
		expect(screen.getByTitle(m.weird_same_poodle_quell())).toBeDisabled();
		await user.click(screen.getByRole('button', { name: '' }));
		await waitFor(() => expect(getPageData).toHaveBeenCalledTimes(2));
		expect(getPageData).toHaveBeenLastCalledWith(3, 2);
		await user.click(screen.getByTitle(m.misty_heavy_reindeer_aim()));
		await waitFor(() => expect(getPageData).toHaveBeenLastCalledWith(1, 2));
	});
});
