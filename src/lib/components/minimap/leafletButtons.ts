import { asset } from '$app/paths';
import { m } from '$paraglide/messages.js';
import { Control, DomEvent, DomUtil, type LeafletMap } from 'leaflet';

import { mapSizeToggle } from './minimapSize';

function createCustomButtonControl(options: {
	iconUrl: string;
	onClick: () => void;
	position: 'topleft' | 'topright';
	title: string;
}) {
	const customButton = new Control({ position: options.position });

	customButton.onAdd = function () {
		const container = DomUtil.create('div', 'leaflet-bar');
		const button = DomUtil.create('a', 'leaflet-button', container);
		const img = DomUtil.create('img', '', button);
		img.src = options.iconUrl;
		img.title = options.title;
		DomEvent.on(button, 'click', options.onClick, button);
		DomEvent.disableClickPropagation(button);
		return container;
	};

	return customButton;
}

/**
 * Adds a toggle button to the map to enlarge or shrink the map.
 * @param map The Leaflet map instance to attach to.
 * @param toggleFunction Function to call when the toggle button is clicked.
 */
export function addMapSizeToggleButton(map: LeafletMap) {
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

export function addControlButtons(map: LeafletMap) {
	map.addControl(new Control.Zoom({ position: 'topright' }));

	addMapSizeToggleButton(map);
}
