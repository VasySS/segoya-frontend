<script lang="ts">
	import { YANDEX_API_KEY } from '$lib/api/base';
	import { APIKeys } from '$lib/constants/enums';
	import { getGameContext } from '$lib/states/gameContext.svelte';
	import { getCookiesFromString } from '$lib/utils/auth';
	import { onDestroy } from 'svelte';
	import type { panorama } from 'yandex-maps';

	interface Props {
		/**
		 * A callback to update compass direction on panorama's camera movement.
		 */
		updateCompass: ((pov: number) => void) | undefined;
	}
	let { updateCompass }: Props = $props();

	let yandexStreetview: panorama.Player | undefined;
	let panoramaDiv = $state<HTMLElement>();

	const cookies = getCookiesFromString(document.cookie);
	const yandexKeyAPI = cookies[APIKeys.YANDEX] ?? YANDEX_API_KEY;

	const gameContext = getGameContext();
	const game = gameContext.game;
	const round = gameContext.round;

	const panoLayer = game.provider === 'yandex_air' ? 'yandex#airPanorama' : 'yandex#panorama';

	onDestroy(() => {
		yandexStreetview?.destroy();
	});

	function initYmaps() {
		yandexStreetview?.destroy();

		ymaps.panorama
			.locate([round.lat, round.lng], {
				layer: panoLayer
			})
			.then(function (panoramas) {
				if (!panoramas[0] || !panoramaDiv) return;

				yandexStreetview = new ymaps.panorama.Player(panoramaDiv, panoramas[0], {
					suppressMapOpenBlock: true,
					direction: [0, 0],
					controls: [],
					// enable/disable movement
					hotkeysEnabled: game.movementAllowed
				});

				// yandex broke the suppressMapOpenBlock option, so the button has to be hidden manually
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-explicit-any
				const el = document.querySelector('.ymaps-2-1-79-panorama-gotoymaps-container') as any;
				if (el) {
					el.style.display = 'none';
				}

				yandexStreetview.events.add('directionchange', () => {
					const heading = yandexStreetview?.getDirection();
					if (!heading?.[0]) return;

					updateCompass?.(heading[0]);
				});
			})
			.catch(function (error: unknown) {
				// eslint-disable-next-line no-console
				console.error(error);
			});
	}

	export async function returnToStart() {
		await yandexStreetview?.moveTo([round.lat, round.lng], {
			layer: panoLayer
		});
	}

	export function zoomIn() {
		const span = (yandexStreetview?.getSpan() ?? [98, 80]) as [number, number];
		yandexStreetview?.setSpan([span[0] / 2, span[1] / 2]);
	}

	export function zoomOut() {
		const span = (yandexStreetview?.getSpan() ?? [98, 80]) as [number, number];
		yandexStreetview?.setSpan([span[0] * 2, span[1] * 2]);
	}
</script>

<svelte:head>
	<link
		href="https://api-maps.yandex.ru/2.1.79/?apikey={yandexKeyAPI}&lang=ru_RU&csp=true"
		rel="preload"
		as="script"
	/>

	<script
		src="https://api-maps.yandex.ru/2.1.79/?apikey={yandexKeyAPI}&lang=ru_RU&csp=true"
		type="text/javascript"
		onload={async () => {
			await ymaps.ready(initYmaps);
		}}
	></script>
</svelte:head>

<div
	bind:this={panoramaDiv}
	class="h-dvh w-dvw"
></div>
