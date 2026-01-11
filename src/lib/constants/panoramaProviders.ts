import type { Provider } from '$lib/api/openapi';

interface PanoramaProvider {
	label: string;
	value: string;
}

export const defaultProvider: PanoramaProvider = { label: 'Google', value: 'google' } as const;

export const providers: readonly PanoramaProvider[] = [
	defaultProvider,
	{
		label: 'Yandex (streets)',
		value: 'yandex'
	},
	{
		label: 'Yandex (air)',
		value: 'yandex_air'
	},
	{
		label: 'Seznam',
		value: 'seznam'
	}
];

export function getProviderLabel(provider: Provider) {
	switch (provider) {
		case 'google': {
			return 'Google';
		}
		case 'yandex': {
			return 'Yandex (streets)';
		}
		case 'yandex_air': {
			return 'Yandex (air)';
		}
		case 'seznam': {
			return 'Seznam';
		}
		default: {
			return 'Unknown';
		}
	}
}
