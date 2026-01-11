<script lang="ts">
	import { asset } from '$app/paths';
	import { UserSettingsStore } from '$lib/states/localStorage.svelte';
	import { onDestroy, onMount } from 'svelte';

	interface Props {
		/**
		 * Time, from which countdown will start
		 */
		startTimestamp: string;
		/**
		 * Countdown seconds
		 */
		duration: number;
		/**
		 * A callback that fires when time is up
		 */
		timerEndCallback?: () => void;
		/**
		 * Custom text to show besides the time
		 */
		timerText?: string;
		/**
		 * Start playing ticking sound 5 seconds before the end of a timer
		 */
		playSounds?: boolean;
		/**
		 * If duration of a timer is N seconds and startTimestamp is in the future,
		 * with showTimeAboveDuration set to true, the timer will not have extra seconds added
		 * @default true
		 */
		showTimeAboveDuration?: boolean;
	}

	let {
		startTimestamp,
		duration,
		timerEndCallback,
		timerText = '',
		playSounds = false,
		showTimeAboveDuration = true
	}: Props = $props();

	const getTimerDuration = (): number => {
		const now = Date.now();
		const timeNum = new Date(startTimestamp).getTime();

		const endTime = timeNum + duration * 1000;
		return Math.max(0, Math.floor((endTime - now) / 1000));
	};

	const userSettings = UserSettingsStore;

	const tickingSound = new Audio(asset('/sounds/ticking.mp3'));
	tickingSound.volume = $userSettings.sounds.volume;

	let timerDurationSeconds: number = $state(getTimerDuration());
	let interval: ReturnType<typeof setInterval>;

	onMount(() => {
		interval = setInterval(() => {
			if (timerDurationSeconds <= 5 && playSounds && $userSettings.sounds.enabled) {
				tickingSound.play().catch(() => {
					// eslint-disable-next-line no-console
					console.error('Failed to play ticking sound');
				});
			}

			timerDurationSeconds = getTimerDuration();

			if (timerDurationSeconds <= 0) {
				tickingSound.pause();
				clearInterval(interval);

				timerEndCallback?.();
			}
		}, 1000);
	});

	onDestroy(() => {
		tickingSound.pause();
		clearInterval(interval);
	});

	function formatTime(seconds: number): string {
		// if start of the timer in the future, lock the time on actual duration
		if (!showTimeAboveDuration && seconds > duration) {
			seconds = duration;
		}

		const minutes: number = Math.floor(seconds / 60);
		const remainingSeconds: number = seconds % 60;
		return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
	}
</script>

<p class="z-50 {timerDurationSeconds < 10 ? 'text-red-600' : ''}">
	{timerText}
	{formatTime(timerDurationSeconds)}
</p>
