import { rowPaginationFeature, tableFeatures } from '@tanstack/svelte-table';

export const features = tableFeatures({
	rowPaginationFeature
});

export type DataTableFeatures = typeof features;
