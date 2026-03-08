import type {
	MultiplayerGuess,
	MultiplayerRound,
	SingleplayerGuess,
	SingleplayerRound
} from '$lib/api/openapi';
import { formatDistance } from '$lib/utils/formatters';
import { m } from '$paraglide/messages.js';
import {
	FeatureGroup,
	LayerGroup,
	Marker,
	Polyline,
	type LatLngExpression,
	type LeafletMap,
	type PointExpression
} from 'leaflet';

import { getHSLColor } from './leafletUtils';
import { createRealPosIcon, createUserPosIcon } from './minimapIcons';
import { expandMap } from './minimapSize';

/** Creates and adds the real position marker */
function addRealMarker(map: LeafletMap, location: LatLngExpression, roundNum: number): Marker {
	return new Marker(location, { icon: createRealPosIcon(roundNum) }).addTo(map);
}

/** Creates and adds the user position marker */
function addUserMarker(
	map: LeafletMap,
	location: LatLngExpression,
	avatarHash: string,
	username: string
): Marker {
	return new Marker(location, { icon: createUserPosIcon(avatarHash, username) }).addTo(map);
}

/** Fits map bounds to a group of markers, adding padding */
function fitMapToBounds(
	map: LeafletMap,
	markers: Marker[],
	padding: PointExpression = [50, 50]
): void {
	if (markers.length === 0) return;

	if (markers.length === 1 && markers[0]) {
		// If only one marker, center on it with a reasonable zoom
		map.setView(markers[0].getLatLng(), 8);
		return;
	}

	const featureGroup = new FeatureGroup(markers);
	map.fitBounds(featureGroup.getBounds(), { padding: padding });
}

/** Adds the dashed polyline between two points with an outline */
function addGuessPolyline(
	map: LeafletMap,
	realPos: { lat: number; lng: number },
	userPos: { lat: number; lng: number },
	lineColor: string
): [Polyline, Polyline] {
	const lineWeight = 6;
	const outlineWeight = 7;

	const outline = new Polyline([realPos, userPos], {
		color: 'black',
		weight: outlineWeight,
		opacity: 0.9,
		lineCap: 'square',
		dashArray: '10, 10'
	}).addTo(map);

	const line = new Polyline([realPos, userPos], {
		color: lineColor,
		weight: lineWeight,
		lineCap: 'square',
		dashArray: '10, 10'
	}).addTo(map);

	outline.bringToBack();

	return [line, outline];
}

export async function placeSingleplayerRoundEndMarkers(
	map: LeafletMap,
	round: SingleplayerRound,
	userMarker: Marker
): Promise<void> {
	await expandMap(map);

	const realLatLng = { lat: round.lat, lng: round.lng };
	const realMarker = addRealMarker(map, realLatLng, round.roundNum);

	const userLatLng = userMarker.getLatLng();
	const markersToBound: Marker[] = [realMarker];

	if (userLatLng.lat !== 0 && userLatLng.lng !== 0) {
		markersToBound.push(userMarker);

		const lineColor = getHSLColor(round.roundNum, 100);
		addGuessPolyline(map, realLatLng, userLatLng, lineColor);
	}

	fitMapToBounds(map, markersToBound);
}

export async function placeSingleplayerGameEndMarkers(
	map: LeafletMap,
	username: string,
	userAvatarHash: string,
	guesses: SingleplayerGuess[]
) {
	await expandMap(map);

	const allMarkers = [] as Marker[];

	for (const guess of guesses) {
		const realLocation = { lat: guess.roundLat, lng: guess.roundLng };
		const userLocation = { lat: guess.guessLat, lng: guess.guessLng };

		const realMarker = addRealMarker(map, realLocation, guess.roundNum);
		allMarkers.push(realMarker);

		realMarker.bindTooltip(
			`${m.overlayScore()} : ${guess.score.toString()} <br>
			 ${m.spare_plane_opossum_fulfill()} : ${formatDistance(guess.missDistance)} `,
			{
				direction: 'auto',
				offset: [15, 0]
			}
		);

		if (userLocation.lat !== 0 && userLocation.lng !== 0) {
			const userMarker = addUserMarker(map, userLocation, userAvatarHash, username);
			allMarkers.push(userMarker);

			const lineColor = getHSLColor(guess.roundNum, guesses.length);
			addGuessPolyline(map, realLocation, userLocation, lineColor);
		}
	}

	fitMapToBounds(map, allMarkers);
}

export async function placeMultiplayerRoundEndMarkers(
	map: LeafletMap,
	guesses: MultiplayerGuess[],
	roundInfo: MultiplayerRound
) {
	await expandMap(map);

	const allMarkers = [] as Marker[];

	const realLocation = { lat: roundInfo.lat, lng: roundInfo.lng };
	const realMarker = addRealMarker(map, realLocation, roundInfo.roundNum);
	allMarkers.push(realMarker);

	for (const [index, guess] of guesses.entries()) {
		if (guess.lat === 0 && guess.lng === 0) continue;

		const userGuessLocation = { lat: guess.lat, lng: guess.lng };
		const userMarker = addUserMarker(map, userGuessLocation, guess.avatarHash, guess.username);
		allMarkers.push(userMarker);

		const userMissMeters = userMarker.getLatLng().distanceTo(realLocation);
		userMarker.bindTooltip(
			`${guess.username} : ${guess.score.toString()} <br>
             ${m.spare_plane_opossum_fulfill()} : ${formatDistance(userMissMeters)} `,
			{
				permanent: true,
				direction: 'auto',
				offset: [15, 0]
			}
		);

		const lineColor = getHSLColor(roundInfo.roundNum, index + 1);
		addGuessPolyline(map, realLocation, userGuessLocation, lineColor);
	}

	fitMapToBounds(map, allMarkers);
}

export async function placeMultiplayerGameEndMarkers(map: LeafletMap, guesses: MultiplayerGuess[]) {
	await expandMap(map);

	const allMarkers: Marker[] = [];

	const roundLayers = new Map<number, LayerGroup>();
	const realMarkersMap = new Map<number, Marker>();
	const userMarkersMap = new Map<number, Marker[]>();

	for (const guess of guesses) {
		if (!roundLayers.has(guess.roundNum)) {
			roundLayers.set(guess.roundNum, new LayerGroup());
		}

		const roundLayerGroup = roundLayers.get(guess.roundNum);
		if (!roundLayerGroup) continue;

		const realLocation = { lat: guess.roundLat, lng: guess.roundLng };
		let realMarker = realMarkersMap.get(guess.roundNum);

		if (!realMarker) {
			realMarker = addRealMarker(map, realLocation, guess.roundNum);
			realMarkersMap.set(guess.roundNum, realMarker);
			allMarkers.push(realMarker);
		}

		roundLayerGroup.addLayer(realMarker);

		realMarker.on('pointerover', () => {
			// Hide all other round layers, show this one
			for (const [rn, lg] of roundLayers.entries()) {
				if (rn !== guess.roundNum && map.hasLayer(lg)) map.removeLayer(lg);
			}

			if (!map.hasLayer(roundLayerGroup)) map.addLayer(roundLayerGroup);

			const userMarkers = userMarkersMap.get(guess.roundNum) ?? [];
			for (const marker of userMarkers) marker.openTooltip();
		});

		realMarker.on('pointerout', () => {
			// Show all round layers again
			for (const [_, lg] of roundLayers) {
				if (!map.hasLayer(lg)) map.addLayer(lg);
			}

			const userMarkers = userMarkersMap.get(guess.roundNum) ?? [];
			for (const marker of userMarkers) marker.closeTooltip();
		});

		// return early, if user did not send a guess for round - nothing else to add
		if (guess.lat === 0 && guess.lng === 0) {
			continue;
		}

		const userGuessLocation = { lat: guess.lat, lng: guess.lng };
		const userMarker = addUserMarker(map, userGuessLocation, guess.avatarHash, guess.username);
		allMarkers.push(userMarker);
		roundLayerGroup.addLayer(userMarker);

		if (!userMarkersMap.has(guess.roundNum)) {
			userMarkersMap.set(guess.roundNum, []);
		}

		userMarkersMap.get(guess.roundNum)?.push(userMarker);

		userMarker.bindTooltip(`${guess.username} : ${guess.score.toString()}`, {
			permanent: false,
			interactive: false,
			direction: 'auto',
			offset: [15, 0]
		});

		const color = getHSLColor(guess.roundNum, guesses.length);
		const [line, outline] = addGuessPolyline(map, realLocation, userGuessLocation, color);

		roundLayerGroup.addLayer(line);
		roundLayerGroup.addLayer(outline);
	}

	for (const [_, lg] of roundLayers) {
		if (!map.hasLayer(lg)) map.addLayer(lg);
	}

	fitMapToBounds(map, allMarkers);
}
