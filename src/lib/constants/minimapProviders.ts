interface MinimapProvider {
	label: string;
	value: string;
}

export const defaultProvider: MinimapProvider = {
	label: 'OpenStreetMap',
	value: 'default'
} as const;

export const minimapProviders: readonly MinimapProvider[] = [
	defaultProvider,
	{
		label: 'CARTO',
		value: 'carto'
	}
];
