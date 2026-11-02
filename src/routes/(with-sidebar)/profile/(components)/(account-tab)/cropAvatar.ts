import type { CropArea } from 'svelte-easy-crop';

export async function loadAvatarImage(file: File): Promise<HTMLImageElement> {
	const source = await new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.addEventListener('load', () => {
			if (typeof reader.result === 'string') resolve(reader.result);
			else reject(new Error('Failed to read image'));
		});
		reader.addEventListener('error', () => {
			reject(new Error('Failed to read image'));
		});
		reader.readAsDataURL(file);
	});
	const image = new Image();
	image.src = source;
	await image.decode();
	return image;
}

export async function createCroppedAvatar(image: HTMLImageElement, area: CropArea): Promise<File> {
	const canvas = document.createElement('canvas');
	canvas.width = Math.max(1, Math.round(area.width));
	canvas.height = Math.max(1, Math.round(area.height));
	const context = canvas.getContext('2d');
	if (!context) throw new Error('Canvas is unavailable');
	context.drawImage(
		image,
		area.x,
		area.y,
		area.width,
		area.height,
		0,
		0,
		canvas.width,
		canvas.height
	);
	const blob = await new Promise<Blob>((resolve, reject) => {
		canvas.toBlob(
			(result) => {
				if (result) resolve(result);
				else reject(new Error('Failed to crop image'));
			},
			'image/webp',
			0.7
		);
	});
	return new File([blob], 'avatar.webp', { type: blob.type });
}
