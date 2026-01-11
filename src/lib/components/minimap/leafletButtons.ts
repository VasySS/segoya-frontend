import { asset } from '$app/paths';
import { m } from '$paraglide/messages.js';
import L from 'leaflet';

import { mapSizeToggle } from './minimapSize';

function createCustomButtonControl(options: {
	iconUrl: string;
	onClick: () => void;
	position: 'topleft' | 'topright';
	title: string;
}) {
	const CustomButton = L.Control.extend({
		onAdd: function () {
			const container = L.DomUtil.create('div', 'leaflet-bar');
			const button = L.DomUtil.create('a', 'leaflet-button', container);
			const img = L.DomUtil.create('img', '', button);
			img.src = options.iconUrl;
			img.title = options.title;
			L.DomEvent.on(button, 'click', options.onClick, button);
			L.DomEvent.disableClickPropagation(button);
			return container;
		}
	});

	return new CustomButton({ position: options.position });
}

/**
 * Adds a toggle button to the map to enlarge or shrink the map.
 * @param map The Leaflet map instance to attach to.
 * @param toggleFunction Function to call when the toggle button is clicked.
 */
export function addMapSizeToggleButton(map: L.Map) {
	const button = createCustomButtonControl({
		iconUrl: asset('/icons/minimap-size-toggle.svg'),
		onClick: () => {
			mapSizeToggle(map).catch(() => {
				// eslint-disable-next-line no-console
				console.error('Failed to toggle map size');
			});
		},
		position: 'topleft',
		title: m.minimapChangeSize()
	});

	map.addControl(button);
}

export function addControlButtons(map: L.Map) {
	L.control.zoom({ position: 'topright' }).addTo(map);
	addMapSizeToggleButton(map);
}
