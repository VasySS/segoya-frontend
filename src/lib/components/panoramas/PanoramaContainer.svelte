<script lang="ts">
	import Compass from '$components/game/Compass.svelte';
	import Timer from '$components/game/Timer.svelte';
	import { getGameContext } from '$lib/states/gameContext.svelte';
	import { UserSettingsStore } from '$lib/states/localStorage.svelte';
	import { m } from '$paraglide/messages.js';

	import GoogleStreet from './GoogleStreet.svelte';
	import SeznamStreet from './SeznamStreet.svelte';
	import YandexStreet from './YandexStreet.svelte';

	let compass = $state<Compass>();
	let googleStreetView = $state<GoogleStreet>();
	let yandexStreetView = $state<YandexStreet>();
	let seznamStreetView = $state<SeznamStreet>();

	const userSettings = UserSettingsStore;
	const gameContext = getGameContext();
	const game = gameContext.game;
	const round = gameContext.round;

	const timeNow = new Date();
	const timeStart = new Date(round.startedAt);
	let showTimer = $state(timeStart.getTime() > timeNow.getTime());

	export function returnToStart() {
		if (googleStreetView) {
			googleStreetView.returnToStart();
		} else if (yandexStreetView) {
			yandexStreetView.returnToStart();
		} else if (seznamStreetView) {
			seznamStreetView.returnToStart();
		}
	}

	export function zoomIn() {
		if (googleStreetView) {
			googleStreetView.zoomIn();
		} else if (yandexStreetView) {
			yandexStreetView.zoomIn();
		} else if (seznamStreetView) {
			seznamStreetView.zoomIn();
		}
	}

	export function zoomOut() {
		if (googleStreetView) {
			googleStreetView.zoomOut();
		} else if (yandexStreetView) {
			yandexStreetView.zoomOut();
		} else if (seznamStreetView) {
			seznamStreetView.zoomOut();
		}
	}
</script>

{#if $userSettings.compassEnabled}
	<Compass bind:this={compass}></Compass>
{/if}

<!-- a transparent black overlay with timer -->
{#if showTimer}
	<div class="fixed inset-0 z-50 flex flex-col items-center justify-center space-y-3 bg-black/90">
		<p>{`${m.overlayRound()} ${round.roundNum.toString()} ${m.of()} ${game.rounds.toString()}`}</p>
		<Timer
			startTimestamp={timeNow.toISOString()}
			duration={(timeStart.getTime() - timeNow.getTime()) / 1000}
			timerEndCallback={() => (showTimer = false)}
		/>
	</div>
{/if}

{#if game.provider === 'google'}
	<GoogleStreet
		bind:this={googleStreetView}
		updateCompass={compass?.updateCompass}
	/>
{:else if game.provider === 'yandex'}
	<YandexStreet
		bind:this={yandexStreetView}
		updateCompass={compass?.updateCompass}
	/>
{:else if game.provider === 'yandex_air'}
	<!-- the same YandexStreet component is used, left here for future changes  -->
	<YandexStreet
		bind:this={yandexStreetView}
		updateCompass={compass?.updateCompass}
	/>
{:else if game.provider === 'seznam'}
	<SeznamStreet
		bind:this={seznamStreetView}
		updateCompass={compass?.updateCompass}
	/>
{/if}
