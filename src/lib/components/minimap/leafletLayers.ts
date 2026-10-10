import L from 'leaflet';

export interface Layers {
	[key: string]: L.TileLayer;
	default: L.TileLayer;
	esri: L.TileLayer;
}

export const leafletLayers: Layers = {
	default: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		noWrap: true,
		attribution:
			'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		minZoom: 0,
		maxZoom: 20
	}),
	esri: L.tileLayer(
		'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
		{
			noWrap: true,
			attribution:
				'Tiles &copy; <a href="https://www.esri.com/">Esri</a> &mdash; ' +
				'Sources: Esri, HERE, Garmin, USGS, Intermap, INCREMENT P, NRCan, Esri Japan, METI, ' +
				'Esri China (Hong Kong), Esri Korea, Esri (Thailand), NGCC, ' +
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
export function setTileLayer(map: L.Map, tileProvider: string) {
	map.eachLayer(function (layer) {
		map.removeLayer(layer);
	});

	const layerToAdd = leafletLayers[tileProvider] ?? leafletLayers.default;
	map.addLayer(layerToAdd);
}
