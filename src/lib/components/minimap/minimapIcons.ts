import { getAvatarSource } from '$lib/utils/helpers';
import L from 'leaflet';

export function createUserPosIcon(avatarHash: string, username: string) {
	const avatarSrc = getAvatarSource(avatarHash, username);

	return new L.DivIcon({
		iconAnchor: [22, 22],
		// to avoid white square
		className: '',
		html: `<img src="${avatarSrc}" class="rounded-full border-2 border-black size-10" />`
	});
}

export function createRealPosIcon(roundNumber: number) {
	const paddingX = roundNumber < 10 ? 'px-2' : 'px-1';

	return new L.DivIcon({
		iconAnchor: [22, 22],
		iconSize: [40, 40],
		// to avoid white square
		className: '',
		html: `<span 
			class="text-white text-xl bg-primary rounded-full border-2 border-black min-h-10 p-1 ${paddingX}">
				${roundNumber.toString()}
			</span>`
	});
}
