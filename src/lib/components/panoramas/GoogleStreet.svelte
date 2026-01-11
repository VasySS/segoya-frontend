<script lang="ts">
	import { importLibrary, setOptions } from '@googlemaps/js-api-loader';
	import { GOOGLE_API_KEY } from '$lib/api/base';
	import { APIKeys } from '$lib/constants/enums';
	import { getGameContext } from '$lib/states/gameContext.svelte';
	import { getCookiesFromString } from '$lib/utils/auth';
	import { onDestroy, onMount } from 'svelte';

	interface Props {
		/**
		 * A callback to update compass direction on panorama's camera movement.
		 */
		updateCompass: ((pov: number) => void) | undefined;
	}
	let { updateCompass }: Props = $props();

	let googleStreetView: google.maps.StreetViewPanorama | undefined;
	let panoramaDiv = $state<HTMLDivElement>();

	const cookies = getCookiesFromString(document.cookie);
	const googleKeyAPI = cookies[APIKeys.GOOGLE] ?? GOOGLE_API_KEY;

	const gameContext = getGameContext();
	const game = gameContext.game;
	const round = gameContext.round;

	setOptions({
		key: googleKeyAPI,
		libraries: ['core']
	});

	onMount(async () => {
		await importLibrary('streetView');
		initGmaps();
	});

	onDestroy(() => {
		googleStreetView = undefined;
	});

	function initGmaps() {
		if (!panoramaDiv) return;
		googleStreetView = undefined;

		googleStreetView = new google.maps.StreetViewPanorama(panoramaDiv, {
			addressControl: false,
			zoomControl: false,
			showRoadLabels: false,
			fullscreenControl: false,
			motionTracking: false,
			motionTrackingControl: false,
			pov: { heading: 0, pitch: 0 },
			disableDefaultUI: true,
			position: new google.maps.LatLng(round.lat, round.lng),

			// to disable movement
			clickToGo: game.movementAllowed
		});

		googleStreetView.addListener('pov_changed', () => {
			var heading = googleStreetView?.getPov().heading;
			if (!heading) return;

			updateCompass?.(heading);
		});
	}

	export function returnToStart() {
		googleStreetView?.setPosition(new google.maps.LatLng(round.lat, round.lng));
	}

	export function zoomIn() {
		googleStreetView?.setZoom(googleStreetView.getZoom() + 1);
	}

	export function zoomOut() {
		googleStreetView?.setZoom(googleStreetView.getZoom() - 1);
	}
</script>

<div
	bind:this={panoramaDiv}
	class="h-dvh w-dvw"
></div>
