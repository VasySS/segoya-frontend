import { afterEach, describe, expect, it, vi } from 'vitest';

import { createCroppedAvatar } from './cropAvatar';

describe('avatar image processing', () => {
	// eslint-disable-next-line vitest/no-hooks
	afterEach(() => vi.restoreAllMocks());

	it('exports the selected source pixels as a WebP file', async () => {
		expect.hasAssertions();

		const drawImage = vi.fn<CanvasRenderingContext2D['drawImage']>();
		vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
			drawImage
		} as unknown as CanvasRenderingContext2D);
		const toBlob = vi
			.spyOn(HTMLCanvasElement.prototype, 'toBlob')
			.mockImplementation((callback) => {
				callback(new Blob(['pixels'], { type: 'image/webp' }));
			});
		const image = new Image();
		const file = await createCroppedAvatar(image, { x: 20, y: 40, width: 300, height: 300 });

		expect(drawImage).toHaveBeenCalledWith(image, 20, 40, 300, 300, 0, 0, 300, 300);
		expect(toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/webp', 0.7);
		expect(file).toMatchObject({ name: 'avatar.webp', type: 'image/webp', size: 6 });
	});

	it('rejects failed canvas encoding', async () => {
		expect.hasAssertions();

		vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
			drawImage: vi.fn<CanvasRenderingContext2D['drawImage']>()
		} as unknown as CanvasRenderingContext2D);
		vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) => {
			// eslint-disable-next-line unicorn/no-null -- Canvas reports encoding failure with null.
			callback(null);
		});

		await expect(
			createCroppedAvatar(new Image(), { x: 0, y: 0, width: 1, height: 1 })
		).rejects.toThrow('Failed to crop image');
	});
});
