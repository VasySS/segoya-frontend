<script lang="ts">
	import type {
		MultiplayerGuess,
		MultiplayerRound,
		SingleplayerGuess,
		SingleplayerRound,
		UserPublicProfile
	} from '#lib/api/openapi.js';
	import { getGameContext } from '#lib/states/gameContext.svelte.js';
	import { UserSettingsStore } from '#lib/states/localStorage.svelte.js';
	import { m } from '#paraglide/messages.js';
	import L from 'leaflet';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

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
	import {
		addPlayAreaOverlay,
		loadPlayAreaOutlines,
		type PlayAreaOutline
	} from './playAreaOverlay';

	interface Props {
		user: UserPublicProfile;
		jwt: string;
	}
	let { user, jwt }: Props = $props();

	let map: L.Map;
	let mapContainer: HTMLDivElement;
	let resizeObserver: ResizeObserver | undefined;
	let userMarker = $state<L.Marker>();
	let areaOutlines: PlayAreaOutline[] = [];
	let areaLayer: L.FeatureGroup | undefined;
	let hasNavigated = false;
	let isShowingResults = false;
	let areaErrorToast: string | number | undefined;

	const userSettings = UserSettingsStore;
	const gameContext = getGameContext();
	const game = gameContext.game;

	onMount(() => {
		const abort = new AbortController();
		let disposeMap: (() => void) | undefined;

		void resetSizeStores().then(() => {
			if (abort.signal.aborted) return;

			mapInit();
			disposeMap = () => {
				map.off();
				map.remove();
			};

			resizeObserver = new ResizeObserver(() => {
				map.invalidateSize();
			});

			resizeObserver.observe(mapContainer);
			void loadArea(abort.signal);
		});

		return () => {
			abort.abort();
			if (areaErrorToast !== undefined) toast.dismiss(areaErrorToast);
			disposeMap?.();
			resizeObserver?.disconnect();
		};
	});

	async function loadArea(signal: AbortSignal) {
		try {
			signal.throwIfAborted();
			const outlines = await loadPlayAreaOutlines(game.playArea, jwt, signal);
			signal.throwIfAborted();
			areaOutlines = outlines;
			drawArea();
		} catch {
			if (signal.aborted) return;

			areaErrorToast = toast.error(m.areaBoundaryFailed(), {
				action: { label: m.areaRetry(), onClick: () => void loadArea(signal) }
			});
		}
	}

	function drawArea() {
		areaLayer?.remove();
		areaLayer = addPlayAreaOverlay(map, areaOutlines);
		if (areaLayer && !hasNavigated && !isShowingResults && !gameContext.userPlacedMarker)
			map.fitBounds(areaLayer.getBounds(), { padding: [12, 12], maxZoom: 12, animate: false });
	}

	function mapInit() {
		map = L.map(mapContainer, { zoomControl: false });
		areaLayer = undefined;
		hasNavigated = false;

		map.attributionControl.setPrefix('<a href="https://leafletjs.com/">Leaflet</a>');

		setTileProvider($userSettings.minimapProvider);
		addControlButtons(map);
		positionMap(map, game.provider);
		drawArea();
		initMapListeners();
	}

	function initMapListeners() {
		map.on('click', placeUserMarker);
		map.on('dragstart zoomstart', () => {
			hasNavigated = true;
		});

		enableHoverListeners(map);
	}

	function placeUserMarker(e: { latlng: { lat: number; lng: number } }) {
		if (gameContext.userGuessed || gameContext.guessPending) return;
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
		gameContext.userGuessed = true;
		isShowingResults = true;

		await placeSingleplayerRoundEndMarkers(map, roundInfo, userMarker);
	}

	export async function showSingleplayerGameEndMarkers(guesses: SingleplayerGuess[]) {
		gameContext.userGuessed = true;
		isShowingResults = true;

		resetMap();
		await placeSingleplayerGameEndMarkers(
			map,
			user.username,
			user.avatarHash,
			guesses.map((guess) => ({
				...guess,
				hasGuess: gameContext.guessPresence.get(guess.roundNum)
			}))
		);
	}

	function withLocalGuessPresence(guesses: MultiplayerGuess[]) {
		return guesses.map((guess) => ({
			...guess,
			hasGuess:
				guess.username === user.username ? gameContext.guessPresence.get(guess.roundNum) : undefined
		}));
	}

	export async function showMultiplayerRoundEndMarkers(
		guesses: MultiplayerGuess[],
		roundInfo: MultiplayerRound
	) {
		gameContext.userGuessed = true;
		isShowingResults = true;

		resetMap();
		await placeMultiplayerRoundEndMarkers(map, withLocalGuessPresence(guesses), roundInfo);
	}

	export async function showMultiplayerGameEndMarkers(guesses: MultiplayerGuess[]) {
		gameContext.userGuessed = true;
		isShowingResults = true;

		resetMap();
		await placeMultiplayerGameEndMarkers(map, withLocalGuessPresence(guesses));
	}
</script>

<div
	bind:this={mapContainer}
	style="width: {mapWidth.current}%; height: {mapHeight.current}%;"
	class="fixed right-4 bottom-24 z-40 min-h-36 min-w-52 rounded-sm"
	id="minimap"
></div>

<style>
	:global(#minimap .leaflet-bottom.leaflet-right),
	:global(#minimap .leaflet-control-attribution) {
		max-width: 100%;
		overflow-wrap: anywhere;
	}
	:global(#minimap .minimap-play-area-attribution[open]) {
		max-height: 7rem;
		overflow-y: auto;
	}
</style>
