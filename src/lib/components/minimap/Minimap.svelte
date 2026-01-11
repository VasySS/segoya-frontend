<script lang="ts">
	import type {
		MultiplayerGuess,
		MultiplayerRound,
		SingleplayerGuess,
		SingleplayerRound,
		UserPublicProfile
	} from '$lib/api/openapi';
	import { getGameContext } from '$lib/states/gameContext.svelte';
	import { UserSettingsStore } from '$lib/states/localStorage.svelte';
	import L from 'leaflet';
	import { onDestroy, onMount } from 'svelte';

	import 'leaflet/dist/leaflet.css';

	import { addControlButtons } from './leafletButtons';
	import { setTileLayer } from './leafletLayers';
	import { positionMap } from './leafletUtils';
	import { createUserPosIcon } from './minimapIcons';
	import {
		placeMultiplayerGameEndMarkers,
		placeMultiplayerRoundEndMarkers,
		placeSingleplayerGameEndMarkers,
		placeSingleplayerRoundEndMarkers
	} from './minimapMarkers';
	import { enableHoverListeners, mapHeight, mapWidth, resetSizeStores } from './minimapSize';

	interface Props {
		user: UserPublicProfile;
	}
	let { user }: Props = $props();

	let map: L.Map;
	let mapContainer: HTMLDivElement;
	let resizeObserver: ResizeObserver;
	let userMarker = $state<L.Marker>();

	const userSettings = UserSettingsStore;
	const gameContext = getGameContext();
	const game = gameContext.game;

	onMount(async () => {
		await resetSizeStores();
		mapInit();

		resizeObserver = new ResizeObserver(() => {
			map.invalidateSize();
		});

		resizeObserver.observe(mapContainer);
	});

	onDestroy(() => {
		map.off();
		map.remove();

		resizeObserver.disconnect();
	});

	function mapInit() {
		// eslint-disable-next-line unicorn/no-array-callback-reference, unicorn/no-array-method-this-argument
		map = L.map(mapContainer, { zoomControl: false, attributionControl: false });

		const attrControl = L.control.attribution().addTo(map);
		attrControl.setPrefix('<a href="https://leafletjs.com/">Leaflet</a>');

		setTileProvider($userSettings.minimapProvider);
		addControlButtons(map);
		positionMap(map, game.provider);
		initMapListeners();
	}

	function initMapListeners() {
		map.on('click', placeUserMarker);
		enableHoverListeners(map);
	}

	function placeUserMarker(e: { latlng: { lat: number; lng: number } }) {
		if (gameContext.userGuessed) return;
		if (userMarker) userMarker.remove();

		const { lat, lng } = e.latlng;
		userMarker = L.marker([lat, lng], {
			icon: createUserPosIcon(user.avatarHash, user.username)
		}).addTo(map);

		gameContext.userGuess = e.latlng;
		gameContext.userPlacedMarker = true;
	}

	function resetMap() {
		map.off();
		map.remove();

		mapInit();
	}

	export function setTileProvider(provider: string) {
		setTileLayer(map, provider);
	}

	export async function showSingleplayerRoundEndMarkers(roundInfo: SingleplayerRound) {
		userMarker ??= L.marker([0, 0]);
		gameContext.userGuessed = true;

		await placeSingleplayerRoundEndMarkers(map, roundInfo, userMarker);
	}

	export async function showSingleplayerGameEndMarkers(guesses: SingleplayerGuess[]) {
		gameContext.userGuessed = true;

		resetMap();
		await placeSingleplayerGameEndMarkers(map, user.username, user.avatarHash, guesses);
	}

	export async function showMultiplayerRoundEndMarkers(
		guesses: MultiplayerGuess[],
		roundInfo: MultiplayerRound
	) {
		gameContext.userGuessed = true;

		resetMap();
		await placeMultiplayerRoundEndMarkers(map, guesses, roundInfo);
	}

	export async function showMultiplayerGameEndMarkers(guesses: MultiplayerGuess[]) {
		gameContext.userGuessed = true;

		resetMap();
		await placeMultiplayerGameEndMarkers(map, guesses);
	}
</script>

<div
	bind:this={mapContainer}
	style="width: {mapWidth.current}%; height: {mapHeight.current}%;"
	class="fixed right-4 bottom-24 z-40 min-h-36 min-w-52 rounded-sm"
	id="minimap"
></div>
