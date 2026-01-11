<script lang="ts">
	import { formatDistance } from '$lib/utils/formatters';
	import { onMount } from 'svelte';
	import { quintOut } from 'svelte/easing';
	import { Tween } from 'svelte/motion';

	interface Props {
		score: number;
		maxScore?: number;
		/**
		 * Distance in meters
		 */
		distance: number;
	}
	let { score, maxScore = 5000, distance }: Props = $props();

	let scoreStore = new Tween(0, { duration: 2000, easing: quintOut });
	let distanceStore = new Tween(0, { duration: 2000, easing: quintOut });

	onMount(async () => {
		await Promise.all([scoreStore.set(score), distanceStore.set(distance)]);
	});
</script>

<div class="mx-1 flex w-full items-center justify-center space-x-4">
	<p class="text-xl">{scoreStore.current.toFixed(0)}/{maxScore}</p>
	<p class="text-xl">{formatDistance(distanceStore.current)}</p>
</div>
