import { Tween } from 'svelte/motion';
import { MediaQuery } from 'svelte/reactivity';

const mapDimensions = {
	initial: { height: 25, width: 20 },
	hover: { height: 40, width: 35 },
	large: { height: 60, width: 50 },
	largeMobile: { height: 70, width: 90 }
};

const large = new MediaQuery('min-width: 800px');

export const mapHeight = new Tween(mapDimensions.initial.height, {
	duration: 150
});

export const mapWidth = new Tween(mapDimensions.initial.width, {
	duration: 150
});

const handleMouseOver = () => {
	Promise.all([
		mapHeight.set(mapDimensions.hover.height),
		mapWidth.set(mapDimensions.hover.width)
	]).catch(() => {
		// eslint-disable-next-line no-console
		console.error('Could not reset map size on mouse over');
	});
};

const handleMouseOut = () => {
	Promise.all([
		mapHeight.set(mapDimensions.initial.height),
		mapWidth.set(mapDimensions.initial.width)
	]).catch(() => {
		// eslint-disable-next-line no-console
		console.error('Could not reset map size on mouse out');
	});
};

export async function resetSizeStores(): Promise<void> {
	await Promise.all([
		mapHeight.set(mapDimensions.initial.height),
		mapWidth.set(mapDimensions.initial.width)
	]);
}

export function enableHoverListeners(map: L.Map) {
	map.on('mouseover', handleMouseOver);
	map.on('mouseout', handleMouseOut);
}

function disableHoverListeners(map: L.Map) {
	map.off('mouseover', handleMouseOver);
	map.off('mouseout', handleMouseOut);
}

export async function expandMap(map: L.Map): Promise<void> {
	disableHoverListeners(map);

	if (large.current) {
		await Promise.all([
			mapWidth.set(mapDimensions.large.width),
			mapHeight.set(mapDimensions.large.height)
		]);
	} else {
		await Promise.all([
			mapWidth.set(mapDimensions.largeMobile.width),
			mapHeight.set(mapDimensions.largeMobile.height)
		]);
	}
}

export async function shrinkMap(map: L.Map): Promise<void> {
	enableHoverListeners(map);

	await Promise.all([
		mapWidth.set(mapDimensions.initial.width),
		mapHeight.set(mapDimensions.initial.height)
	]);
}

// if user made minimap bigger by click, disable hover listeners
// until they make it smaller again
export async function mapSizeToggle(map: L.Map): Promise<void> {
	const isLarge =
		mapHeight.current === mapDimensions.large.height ||
		mapHeight.current === mapDimensions.largeMobile.height;

	await (isLarge ? shrinkMap : expandMap)(map);
}
