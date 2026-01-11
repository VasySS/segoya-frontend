export const formatDistance = (meters: number) =>
	meters >= 1000 ? (meters / 1000).toFixed(2) + ' km' : meters.toString() + ' m';

export function formatTimerTime(seconds: number): string {
	const minutes: number = Math.floor(seconds / 60);
	const remainingSeconds: number = seconds % 60;

	return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}
