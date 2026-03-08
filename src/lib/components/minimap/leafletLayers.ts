import { TileLayer, type LeafletMap } from 'leaflet';

export interface Layers {
	[key: string]: TileLayer;
	carto: TileLayer;
	default: TileLayer;
}

export const leafletLayers: Layers = {
	carto: new TileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
		noWrap: true,
		attribution:
			'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors ' +
			'&copy; <a href="https://carto.com/attributions">CARTO</a>',
		subdomains: 'abcd',
		maxZoom: 20
	}),
	default: new TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		noWrap: true,
		attribution:
			'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		minZoom: 0,
		maxZoom: 20
	})
};

/**
 * Sets the tile layer for the map based on the provided or stored tile provider.
 * @param map The Leaflet map instance.
 * @param tileProvider Optional specific tile provider to use, OSM by default.
 */
export function setTileLayer(map: LeafletMap, tileProvider: string) {
	map.eachLayer(function (layer) {
		map.removeLayer(layer);
	});

	const layerToAdd = leafletLayers[tileProvider] ?? leafletLayers.default;
	map.addLayer(layerToAdd);
}
