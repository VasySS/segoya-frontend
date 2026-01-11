<!-- 
@component
A horizontal compass component,
heavily modified version of this compass from codepen: https://codepen.io/Chester/pen/MWPdJZp
-->
<script lang="ts">
	import { m } from '$paraglide/messages.js';
	import { onMount } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';

	let compassContainer: HTMLDivElement;

	const large = new MediaQuery('min-width: 800px');

	onMount(() => {
		updateCompass(0);
	});

	export function updateCompass(pov: number) {
		const normalizedPov = pov < 0 ? pov + 360 : 360 - pov;
		const percents = (normalizedPov / 360) * 100;

		compassContainer.style.setProperty('--left', `${percents.toString()}%`);
	}
</script>

<div
	bind:this={compassContainer}
	class="fixed top-2 left-1/2 z-20 w-96 -translate-x-1/2 rounded-full"
	hidden={!large.current}
>
	<div
		class="relative h-14 overflow-hidden bg-black/80"
		style="mask-image: linear-gradient(90deg, transparent, #000 40%, #000 55%, transparent 95%)"
	>
		<div class="arrow relative top-9 left-[calc(50%-0.6rem)] z-10 text-red-600">▲</div>

		<div
			class="points fixed top-2 flex w-full gap-8"
			style="left: calc(var(--left, 0%) - 100%)"
		>
			<div class="-mr-1.5"></div>
			<div class="point -mr-6"></div>
			<div class="point -mr-5">{m.compassWest()}</div>
			<div class="point -mr-6"></div>
			<!-- start -->
			<div class="point text-red -mr-5">{m.compassNorth()}</div>
			<div class="point -mr-6"></div>
			<div class="point -mr-5">{m.compassEast()}</div>
			<div class="point -mr-6"></div>
			<div class="point -mr-5">{m.compassSouth()}</div>
			<div class="point -mr-6"></div>
			<div class="point -mr-5">{m.compassWest()}</div>
			<div class="point -mr-6"></div>
			<div class="point text-red -mr-5">{m.compassNorth()}</div>
			<div class="point -mr-6"></div>
			<div class="point -mr-5">{m.compassEast()}</div>
			<div class="point -mr-6"></div>
			<div class="point -mr-5">{m.compassSouth()}</div>
		</div>
	</div>
</div>

<style>
	.point {
		position: relative;
		flex-shrink: 0;
		width: 10%;
		display: flex;
		justify-content: center;
		align-items: center;
		font-weight: 900;
		font-size: 1.5rem;
		height: 3rem;

		&::before {
			content: '';
			position: absolute;
			top: 0.2rem;
			left: calc(50% - 1px);
			width: 2px;
			height: 0.5rem;
			background: currentColor;
		}
	}
</style>
