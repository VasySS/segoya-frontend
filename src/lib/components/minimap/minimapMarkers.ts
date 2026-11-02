import type {
	LatLng,
	MultiplayerGuess,
	MultiplayerRound,
	SingleplayerGuess,
	SingleplayerRound
} from '#lib/api/openapi.js';
import { formatDistance } from '#lib/utils/formatters.js';
import { m } from '#paraglide/messages.js';
import {
	FeatureGroup,
	LayerGroup,
	Marker,
	Polyline,
	type LatLngExpression,
	type LeafletMap
} from 'leaflet';

import { getHSLColor, isMousePointerEvent } from './leafletUtils';
import { createRealPosIcon, createUserPosIcon } from './minimapIcons';
import { expandMap } from './minimapSize';

interface GuessPresence {
	hasGuess?: boolean | undefined;
}

function shouldShowGuess(
	coordinates: LatLng,
	score: number,
	hasGuess?: boolean,
	distance = 0
): boolean {
	// Flat history cannot distinguish a missing guess from a zero-score (0,0) guess.
	// Prefer known presence; otherwise show coordinates confirmed by score or distance.
	return hasGuess ?? (coordinates.lat !== 0 || coordinates.lng !== 0 || score > 0 || distance > 0);
}

/**
Creates and adds the real position marker
*/
function addRealMarker(map: LeafletMap, location: LatLngExpression, roundNum: number): Marker {
	return new Marker(location, { icon: createRealPosIcon(roundNum) }).addTo(map);
}

/**
Creates and adds the user position marker
*/
function addUserMarker(
	map: LeafletMap,
	location: LatLngExpression,
	avatarHash: string,
	username: string
): Marker {
	return new Marker(location, { icon: createUserPosIcon(avatarHash, username) }).addTo(map);
}

/**
Fits map bounds to a group of markers, adding padding
*/
function fitMapToBounds(map: LeafletMap, markers: Marker[]): void {
	if (markers.length === 0) return;

	if (markers.length === 1 && markers[0]) {
		// If only one marker, center on it with a reasonable zoom
		map.setView(markers[0].getLatLng(), 8);
		return;
	}

	const featureGroup = new FeatureGroup(markers);
	map.fitBounds(featureGroup.getBounds(), { padding: [50, 50] });
}

/**
Adds the dashed polyline between two points with an outline
*/
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
	userMarker: Marker | undefined
): Promise<void> {
	await expandMap(map);

	const realLatLng = { lat: round.lat, lng: round.lng };
	const realMarker = addRealMarker(map, realLatLng, round.roundNum);

	const markersToBound: Marker[] = [realMarker];

	if (userMarker) {
		const userLatLng = userMarker.getLatLng();
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
	guesses: (SingleplayerGuess & GuessPresence)[]
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

		if (!shouldShowGuess(userLocation, guess.score, guess.hasGuess, guess.missDistance)) continue;

		const userMarker = addUserMarker(map, userLocation, userAvatarHash, username);
		allMarkers.push(userMarker);

		const lineColor = getHSLColor(guess.roundNum, guesses.length);
		addGuessPolyline(map, realLocation, userLocation, lineColor);
	}

	fitMapToBounds(map, allMarkers);
}

export async function placeMultiplayerRoundEndMarkers(
	map: LeafletMap,
	guesses: (MultiplayerGuess & GuessPresence)[],
	roundInfo: MultiplayerRound
) {
	await expandMap(map);

	const allMarkers = [] as Marker[];

	const realLocation = { lat: roundInfo.lat, lng: roundInfo.lng };
	const realMarker = addRealMarker(map, realLocation, roundInfo.roundNum);
	allMarkers.push(realMarker);

	for (const [index, guess] of guesses.entries()) {
		if (!shouldShowGuess(guess, guess.score, guess.hasGuess)) continue;

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

export async function placeMultiplayerGameEndMarkers(
	map: LeafletMap,
	guesses: (MultiplayerGuess & GuessPresence)[]
) {
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

		realMarker.on('pointerover', (event) => {
			if (!isMousePointerEvent(event)) return;

			// Hide all other round layers, show this one
			for (const [rn, lg] of roundLayers) {
				if (rn !== guess.roundNum && map.hasLayer(lg)) map.removeLayer(lg);
			}

			if (!map.hasLayer(roundLayerGroup)) map.addLayer(roundLayerGroup);

			const userMarkers = userMarkersMap.get(guess.roundNum) ?? [];
			for (const marker of userMarkers) marker.openTooltip();
		});

		realMarker.on('pointerout', (event) => {
			if (!isMousePointerEvent(event)) return;

			// Show all round layers again
			for (const [_, lg] of roundLayers) {
				if (!map.hasLayer(lg)) map.addLayer(lg);
			}

			const userMarkers = userMarkersMap.get(guess.roundNum) ?? [];
			for (const marker of userMarkers) marker.closeTooltip();
		});

		if (!shouldShowGuess(guess, guess.score, guess.hasGuess)) {
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
