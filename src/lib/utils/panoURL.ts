import type { Provider } from '$lib/api/openapi';

export function panoURL(provider: Provider, streetviewID: string, lat: number, lng: number) {
	switch (provider) {
		case 'google': {
			return googlePanoURL(streetviewID, lat, lng);
		}
		case 'seznam': {
			return seznamPanoURL(streetviewID, lat, lng);
		}
		case 'yandex': {
			return yandexStreetURL(streetviewID, lat, lng);
		}
		case 'yandex_air': {
			return yandexAirURL(streetviewID, lat, lng);
		}
		default: {
			return '';
		}
	}
}

function googlePanoURL(_: string, lat: number, lng: number) {
	const baseURL = new URL('https://www.google.com/maps/@');
	const params = new URLSearchParams({
		api: '1',
		map_action: 'pano',
		viewpoint: `${lat.toFixed(6)},${lng.toFixed(6)}`
	});
	baseURL.search = params.toString();

	return baseURL.href;
}

function seznamPanoURL(_: string, lat: number, lng: number) {
	const baseURL = new URL('https://en.mapy.cz/zakladni');
	const params = new URLSearchParams({
		pid: '1',
		newest: '1',
		x: lng.toFixed(6),
		y: lat.toFixed(6),
		z: '11'
	});
	baseURL.search = params.toString();

	return baseURL.href;
}

function yandexStreetURL(_: string, lat: number, lng: number) {
	const baseURL = new URL('https://yandex.ru/maps');
	const params = new URLSearchParams({
		'panorama[full]': 'true',
		'panorama[point]': `${lng.toFixed(6)},${lat.toFixed(6)}`
	});
	baseURL.search = params.toString();

	return baseURL.href;
}

function yandexAirURL(id: string, lat: number, lng: number) {
	const baseURL = new URL('https://yandex.ru/maps');
	const params = new URLSearchParams({
		'panorama[id]': id,
		'panorama[full]': 'true',
		'panorama[air]': 'true',
		'panorama[point]': `${lng.toFixed(6)},${lat.toFixed(6)}`
	});
	baseURL.search = params.toString();

	return baseURL.href;
}
