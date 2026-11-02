import { fireEvent, screen, waitFor } from '@testing-library/svelte';
import { m } from '#paraglide/messages.js';
import { setupComponent } from '#tests/vitestSetup.js';
import { tick } from 'svelte';
import { toast } from 'svelte-sonner';
import { superValidate } from 'sveltekit-superforms';
import * as superforms from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import AvatarUpload from './AvatarUpload.svelte';
import { createCroppedAvatar, loadAvatarImage } from './cropAvatar';
import { avatarSchema } from './schema';

vi.mock(import('./cropAvatar'), () => ({
	loadAvatarImage: vi.fn<typeof loadAvatarImage>(),
	createCroppedAvatar: vi.fn<typeof createCroppedAvatar>()
}));

const imageFile = new File(['image'], 'avatar.png', { type: 'image/png' });

async function renderUpload(isOpen = true) {
	const avatarForm = await superValidate(zod4(avatarSchema));
	return setupComponent(AvatarUpload, { props: { avatarForm, isAvatarUploadOpen: isOpen } });
}

async function selectImage(file = imageFile) {
	const input = screen.getByLabelText<HTMLInputElement>(m.funny_simple_fireant_loop());
	Object.defineProperty(input, 'files', { value: [file], configurable: true, writable: true });
	await fireEvent.change(input);
}

describe('avatar upload component', () => {
	// eslint-disable-next-line vitest/no-hooks
	beforeEach(() => {
		const image = new Image();
		image.src = 'data:image/png;base64,aW1hZ2U=';
		vi.mocked(loadAvatarImage).mockResolvedValue(image);
		vi.mocked(createCroppedAvatar).mockResolvedValue(
			new File(['cropped'], 'avatar.webp', { type: 'image/webp' })
		);
		vi.spyOn(HTMLImageElement.prototype, 'width', 'get').mockReturnValue(300);
		vi.spyOn(HTMLImageElement.prototype, 'height', 'get').mockReturnValue(300);
		vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockReturnValue(600);
		vi.spyOn(HTMLImageElement.prototype, 'naturalHeight', 'get').mockReturnValue(600);
		vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(true);
	});

	// eslint-disable-next-line vitest/no-hooks
	afterEach(() => {
		vi.clearAllMocks();
		vi.restoreAllMocks();
	});

	it('keeps the dialog closed by default', async () => {
		expect.hasAssertions();

		await renderUpload(false);

		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	});

	it('disables saving until a crop is ready, then exports the selected square', async () => {
		expect.hasAssertions();

		const submit = vi
			.spyOn(HTMLFormElement.prototype, 'requestSubmit')
			.mockImplementation(vi.fn<HTMLFormElement['requestSubmit']>());
		await renderUpload();

		expect(screen.getByRole('button', { name: m.save() })).toBeDisabled();

		await selectImage();
		await waitFor(() => expect(screen.getByRole('button', { name: m.save() })).toBeEnabled());
		await fireEvent.click(screen.getByRole('button', { name: m.save() }));
		await waitFor(() => {
			expect(submit).toHaveBeenCalledTimes(1);
		});

		expect(createCroppedAvatar).toHaveBeenCalledWith(expect.any(HTMLImageElement), {
			x: 0,
			y: 0,
			width: 600,
			height: 600
		});
	});

	it('rejects files over 2 MB before decoding', async () => {
		expect.hasAssertions();

		await renderUpload();
		await selectImage(new File([new Uint8Array(2 * 1024 * 1024 + 1)], 'large.png'));

		expect(loadAvatarImage).not.toHaveBeenCalled();
		expect(toast.error).toHaveBeenCalledWith(m.misty_petty_cuckoo_exhale());
	});

	it('reports unreadable images and leaves saving disabled', async () => {
		expect.hasAssertions();

		vi.mocked(loadAvatarImage).mockRejectedValueOnce(new Error('Invalid image'));
		await renderUpload();
		await selectImage();
		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith(m.heroic_plain_reindeer_tickle(), {
				description: 'Failed to initialize image cropper'
			});
		});

		expect(screen.getByRole('button', { name: m.save() })).toBeDisabled();
	});

	it('ignores an image that finishes decoding after the editor closes', async () => {
		expect.hasAssertions();

		const pending = Promise.withResolvers<HTMLImageElement>();
		vi.mocked(loadAvatarImage).mockReturnValueOnce(pending.promise);
		const { rerender } = await renderUpload();
		await selectImage();
		await rerender({ isAvatarUploadOpen: false });
		await rerender({ isAvatarUploadOpen: true });
		pending.resolve(new Image());
		await pending.promise;
		await tick();

		expect(screen.queryByTestId('cropper')).not.toBeInTheDocument();
		expect(screen.getByRole('button', { name: m.save() })).toBeDisabled();
	});

	it('reports crop export failures and allows retrying', async () => {
		expect.hasAssertions();

		vi.mocked(createCroppedAvatar).mockRejectedValueOnce(new Error('Canvas failed'));
		await renderUpload();
		await selectImage();
		await waitFor(() => expect(screen.getByRole('button', { name: m.save() })).toBeEnabled());
		await fireEvent.click(screen.getByRole('button', { name: m.save() }));
		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith(m.heroic_plain_reindeer_tickle(), {
				description: 'Failed to submit avatar'
			});
		});

		expect(screen.getByRole('button', { name: m.save() })).toBeEnabled();
	});

	it('keeps the editor open after a failed response and closes it after success', async () => {
		expect.hasAssertions();

		const spy = vi.spyOn(superforms, 'superForm');
		await renderUpload();
		const onResult = spy.mock.calls[0]?.[1]?.onResult;
		// eslint-disable-next-line vitest/no-conditional-in-test
		if (!onResult) throw new Error('Missing enhanced avatar form callback');
		const formElement = screen.getByRole<HTMLFormElement>('form', {
			name: 'avatar-upload',
			hidden: true
		});
		const event = { formElement, formEl: formElement, cancel: vi.fn<() => void>() };
		await onResult({
			...event,
			result: { type: 'failure', status: 400, data: {}, location: '/profile' }
		});

		expect(screen.getByRole('dialog')).toBeInTheDocument();

		await onResult({ ...event, result: { type: 'redirect', status: 303, location: '/profile' } });
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
	});
});
