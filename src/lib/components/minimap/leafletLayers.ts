import { TileLayer, type LeafletMap } from 'leaflet';

export interface Layers {
	[key: string]: TileLayer;
	default: TileLayer;
	esri: TileLayer;
}

export const leafletLayers: Layers = {
	default: new TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		noWrap: true,
		attribution:
			'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		minZoom: 0,
		maxZoom: 20
	}),
	esri: new TileLayer(
		'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
		{
			noWrap: true,
			attribution:
				'Tiles &copy; <a href="https://www.esri.com/">Esri</a> &mdash; ' +
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
				'and the GIS User Community',
			minZoom: 0,
			maxZoom: 20
		}
	)
};

/**
Sets the tile layer for the map based on the provided or stored tile provider.
@param map The Leaflet map instance.
@param tileProvider Optional specific tile provider to use, OSM by default.
*/
export function setTileLayer(map: LeafletMap, tileProvider: string) {
	map.eachLayer(function (layer) {
		map.removeLayer(layer);
	});

	const layerToAdd = leafletLayers[tileProvider] ?? leafletLayers.default;
	map.addLayer(layerToAdd);
}
