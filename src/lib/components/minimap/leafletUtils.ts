import type { Provider } from '$lib/api/openapi';
import type { LeafletMap } from 'leaflet';

export function positionMap(map: LeafletMap, provider: Provider) {
	switch (provider) {
		case 'yandex': {
			map.setView([61.055, 93.595], 3);
			break;
		}
		case 'seznam': {
			map.setView([49.816, 15.451], 7);
			break;
		}
		default: {
			map.setView([0, 0], 2);
			break;
		}
	}
}

export function getHSLColor(index: number, total: number) {
	const hue = (index / total) * 360; // Evenly spaced hues
	return `hsl(${hue.toString()}, 100%, 50%)`;
}
