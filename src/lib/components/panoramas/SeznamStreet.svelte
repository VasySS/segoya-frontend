<script lang="ts">
	import { SEZNAM_API_KEY } from '$lib/api/base';
	import { APIKeys } from '$lib/constants/enums';
	import { getGameContext } from '$lib/states/gameContext.svelte';
	import type { ICreatePanoFromPositionOutput } from '$lib/types/seznam';
	import { getCookiesFromString } from '$lib/utils/auth';
	import { getLocale } from '$paraglide/runtime.js';

	interface Props {
		/**
		 * A callback to update compass direction on panorama's camera movement.
		 */
		updateCompass: ((pov: number) => void) | undefined;
	}
	let { updateCompass }: Props = $props();

	let seznamStreetview = $state<ICreatePanoFromPositionOutput>();
	let panoramaDiv = $state<HTMLDivElement>();

	const cookies = getCookiesFromString(document.cookie);
	const seznamKeyAPI = cookies[APIKeys.SEZNAM] ?? SEZNAM_API_KEY;

	const gameContext = getGameContext();
	const game = gameContext.game;
	const round = gameContext.round;

	export async function returnToStart() {
		seznamStreetview?.destroy();
		if (!panoramaDiv) return;

		seznamStreetview = await Panorama.panoramaFromPosition({
			parent: panoramaDiv,
			// WGS84 lon/lat
			lon: round.lng,
			lat: round.lat,
			yaw: 0,
			apiKey: seznamKeyAPI,
			// enable/disable movement
			showNavigation: game.movementAllowed,
			lang: getLocale()
		});

		seznamStreetview.addListener('pano-view', (viewData) => {
			updateCompass?.(viewData.angle);
		});
	}

	export function zoomIn() {
		if (!seznamStreetview) return;

		const currentCamera = seznamStreetview.getCamera();

		seznamStreetview.setCamera({
			...currentCamera,
			fov: seznamStreetview.getCamera().fov - 0.3
		});
	}

	export function zoomOut() {
		if (!seznamStreetview) return;

		const currentCamera = seznamStreetview.getCamera();

		seznamStreetview.setCamera({
			...currentCamera,
			fov: seznamStreetview.getCamera().fov + 0.3
		});
	}
</script>

<svelte:head>
	<link
		href="https://api.mapy.cz/js/panorama/v1/panorama.js"
		rel="preload"
		as="script"
	/>

	<script
		src="https://api.mapy.cz/js/panorama/v1/panorama.js"
		type="text/javascript"
		onload={async () => {
			await returnToStart();
		}}
	></script>
</svelte:head>

<div
	bind:this={panoramaDiv}
	class="h-dvh w-dvw"
></div>
