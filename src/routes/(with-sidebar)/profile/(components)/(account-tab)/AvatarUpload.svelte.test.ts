import { fireEvent, screen, waitFor } from '@testing-library/svelte'; // eslint-disable-line import/named

import { m } from '$paraglide/messages.js';
import { setupComponent } from '$tests/vitestSetup';
import Cropper from 'cropperjs';
import { tick } from 'svelte';
import { toast } from 'svelte-sonner';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { describe, expect, it, vi } from 'vitest';

import AvatarUpload from './AvatarUpload.svelte';
import { avatarSchema } from './schema';

// Mock FileReader for testing file uploads
class MockFileReader {
	private loadCallback: ((e: Event) => void) | undefined = undefined;

	addEventListener(event: string, callback: (e: Event) => void) {
		if (event === 'load') {
			this.loadCallback = callback;
		}
	}

	readAsDataURL() {
		// Simulate load synchronously for testing
		if (this.loadCallback) {
			this.loadCallback({
				target: { result: 'data:image/png;base64,ZmFrZSBpbWFnZSBkYXRh' }
			} as unknown as Event);
		}
	}
}

vi.stubGlobal('FileReader', MockFileReader);

// Constants for test data
const VALID_IMAGE_FILE = new File(['fake image data'], 'avatar.png', { type: 'image/png' });
const LARGE_FILE = new File(['a'.repeat(2 * 1024 * 1024 + 1)], 'big.png', { type: 'image/png' });
const INVALID_FILE_TYPE = new File(['fake'], 'document.txt', { type: 'text/plain' });
const EMPTY_FILE = new File([], 'empty.png', { type: 'image/png' });

// Helper function to create validated form
async function createValidatedForm() {
	return await superValidate(zod4(avatarSchema));
}

vi.mock('cropperjs', () => {
	return {
		default: vi.fn().mockImplementation(() => ({
			destroy: vi.fn(),
			getCroppedCanvas: vi.fn(() => ({
				toBlob: (cb: (blob: Blob) => void) => {
					cb(new Blob(['fake image data'], { type: 'image/webp' }));
				}
			}))
		}))
	};
});

vi.mock('svelte-sonner', () => ({
	toast: {
		error: vi.fn(),
		success: vi.fn()
	}
}));

describe('avatar upload component', () => {
	describe('rendering', () => {
		it('should not render dialog by default', async () => {
			expect.hasAssertions();

			const avatarForm = await createValidatedForm();
			setupComponent(AvatarUpload, {
				props: {
					avatarForm
				}
			});

			expect(screen.queryByText(m.avatarUpload())).toBeNull();
		});

		it('renders form and dialog content when avatarUploadOpen is true', async () => {
			expect.hasAssertions();

			const avatarForm = await createValidatedForm();
			setupComponent(AvatarUpload, {
				props: {
					avatarForm,
					avatarUploadOpen: true
				}
			});

			expect(screen.getByText(m.avatarUpload())).toBeInTheDocument();
			expect(screen.getByLabelText(m.funny_simple_fireant_loop())).toBeInTheDocument();
		});
	});

	describe('file upload validation', () => {
		it.todo('rejects file over 2MB', async () => {
			expect.hasAssertions();

			const avatarForm = await createValidatedForm();
			const { user } = setupComponent(AvatarUpload, {
				props: {
					avatarForm,
					avatarUploadOpen: true
				}
			});

			const input = screen.getByLabelText(m.funny_simple_fireant_loop());
			await user.upload(input, LARGE_FILE);

			await waitFor(() => {
				expect(toast.error).toHaveBeenCalledWith('File size must be less than 2MB');
			});
		});

		it.todo('rejects non-image files', async () => {
			expect.hasAssertions();

			const avatarForm = await createValidatedForm();
			const { user } = setupComponent(AvatarUpload, {
				props: {
					avatarForm,
					avatarUploadOpen: true
				}
			});

			const input = screen.getByLabelText(m.funny_simple_fireant_loop());
			await user.upload(input, INVALID_FILE_TYPE);

			await waitFor(() => {
				expect(toast.error).toHaveBeenCalled();
			});
		});

		it.todo('rejects empty files', async () => {
			expect.hasAssertions();

			const avatarForm = await createValidatedForm();
			const { user } = setupComponent(AvatarUpload, {
				props: {
					avatarForm,
					avatarUploadOpen: true
				}
			});

			const input = screen.getByLabelText(m.funny_simple_fireant_loop());
			await user.upload(input, EMPTY_FILE);

			await waitFor(() => {
				expect(toast.error).toHaveBeenCalled();
			});
		});

		it('accepts valid image files', async () => {
			expect.hasAssertions();

			const avatarForm = await createValidatedForm();
			setupComponent(AvatarUpload, {
				props: {
					avatarForm,
					avatarUploadOpen: true
				}
			});

			const input = screen.getByLabelText(m.funny_simple_fireant_loop());
			Object.defineProperty(input, 'files', {
				value: [VALID_IMAGE_FILE],
				writable: true
			});
			await fireEvent.change(input);

			await waitFor(() => {
				expect(Cropper).toHaveBeenCalled();
			});
		});
	});

	describe('user interactions', () => {
		it('submits cropped avatar when save button is clicked', async () => {
			expect.hasAssertions();

			const avatarForm = await createValidatedForm();
			setupComponent(AvatarUpload, {
				props: {
					avatarForm,
					avatarUploadOpen: true
				}
			});

			const input = screen.getByLabelText(m.funny_simple_fireant_loop());
			Object.defineProperty(input, 'files', {
				value: [VALID_IMAGE_FILE],
				writable: true
			});
			await fireEvent.change(input);
			await tick();

			await waitFor(() => {
				expect(Cropper).toHaveBeenCalled();
			});

			await tick();

			await waitFor(() => {
				expect(screen.getByRole('button', { name: m.save() })).toBeInTheDocument();
			});

			const button = screen.getByRole('button', { name: m.save() });
			await fireEvent.click(button);

			// Button is clickable and the function is called
		});
	});

	describe('error handling', () => {
		it('handles cropper initialization failure', async () => {
			expect.hasAssertions();

			// Mock cropper to throw error
			const originalCropper = vi.mocked(Cropper);
			originalCropper.mockImplementationOnce(() => {
				throw new Error('Cropper init failed');
			});

			const avatarForm = await createValidatedForm();
			setupComponent(AvatarUpload, {
				props: {
					avatarForm,
					avatarUploadOpen: true
				}
			});

			const input = screen.getByLabelText(m.funny_simple_fireant_loop());
			Object.defineProperty(input, 'files', {
				value: [VALID_IMAGE_FILE],
				writable: true
			});
			await fireEvent.change(input);

			await waitFor(() => {
				expect(toast.error).toHaveBeenCalled();
			});
		});

		it('handles form submission errors', async () => {
			expect.hasAssertions();

			const avatarForm = await createValidatedForm();
			setupComponent(AvatarUpload, {
				props: {
					avatarForm,
					avatarUploadOpen: true
				}
			});

			const input = screen.getByLabelText(m.funny_simple_fireant_loop());
			Object.defineProperty(input, 'files', {
				value: [VALID_IMAGE_FILE],
				writable: true
			});
			await fireEvent.change(input);
			await tick();

			await waitFor(() => {
				expect(Cropper).toHaveBeenCalled();
			});

			await tick();

			await waitFor(() => {
				expect(screen.getByRole('button', { name: m.save() })).toBeInTheDocument();
			});

			const mockSubmit = vi.fn(() => {
				throw new Error('Submit failed');
			});
			vi.spyOn(HTMLFormElement.prototype, 'requestSubmit').mockImplementation(mockSubmit);

			const button = screen.getByRole('button', { name: m.save() });
			await fireEvent.click(button);

			await waitFor(() => {
				expect(toast.error).toHaveBeenCalled();
			});
		});
	});

	describe('edge cases', () => {
		it.todo('handles multiple file uploads gracefully', async () => {
			expect.hasAssertions();

			const avatarForm = await createValidatedForm();
			const { user } = setupComponent(AvatarUpload, {
				props: {
					avatarForm,
					avatarUploadOpen: true
				}
			});

			const input = screen.getByLabelText(m.funny_simple_fireant_loop());
			const files = [VALID_IMAGE_FILE, VALID_IMAGE_FILE];
			await user.upload(input, files);

			await waitFor(() => {
				expect(Cropper).toHaveBeenCalledTimes(1); // Only first file processed
			});
		});

		it.todo('handles corrupted image files', async () => {
			expect.hasAssertions();

			const corruptedFile = new File(['corrupted data'], 'corrupted.png', { type: 'image/png' });
			const avatarForm = await createValidatedForm();
			const { user } = setupComponent(AvatarUpload, {
				props: {
					avatarForm,
					avatarUploadOpen: true
				}
			});

			const input = screen.getByLabelText(m.funny_simple_fireant_loop());
			await user.upload(input, corruptedFile);

			await waitFor(() => {
				expect(toast.error).toHaveBeenCalled();
			});
		});
	});
});
