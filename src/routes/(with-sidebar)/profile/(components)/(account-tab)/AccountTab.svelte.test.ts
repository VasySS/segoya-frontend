import { screen, waitFor } from '@testing-library/svelte'; // eslint-disable-line import/named
import { getAvatarSource } from '$lib/utils/helpers';
import { m } from '$paraglide/messages.js';
import { setupComponent } from '$tests/vitestSetup';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { describe, expect, it } from 'vitest';

import AccountTab from './AccountTab.svelte';
import { avatarSchema, formSchema } from './schema';

// Constants for test data
const BASE_USER_INFO = {
	id: 1,
	username: 'testusername',
	name: 'Test User Name',
	registerDate: '2023-01-01T00:00:00Z',
	avatarHash: ''
} as const;

// Helper function to create validated forms
async function createValidatedForms() {
	const userForm = await superValidate(zod4(formSchema));
	const avatarForm = await superValidate(zod4(avatarSchema));
	return { userForm, avatarForm };
}

async function getValidatedForms(initialData?: { name?: string }) {
	const userForm = await superValidate(initialData ?? {}, zod4(formSchema));
	const avatarForm = await superValidate(zod4(avatarSchema));
	return { userForm, avatarForm };
}

describe('component AccountTab', () => {
	describe('rendering', () => {
		it('should render card header correctly', async () => {
			expect.hasAssertions();

			const { userForm, avatarForm } = await createValidatedForms();
			setupComponent(AccountTab, {
				props: {
					avatarForm,
					userForm,
					userInfo: BASE_USER_INFO
				}
			});

			expect(
				screen.getByText(`${m.profileTabAccount()} ${BASE_USER_INFO.username}`)
			).toBeInTheDocument();
		});

		it('should render avatar image correctly', async () => {
			expect.hasAssertions();

			const { userForm, avatarForm } = await createValidatedForms();
			setupComponent(AccountTab, {
				props: {
					avatarForm,
					userForm,
					userInfo: BASE_USER_INFO
				}
			});

			const avatarImage = screen.getByAltText('avatar');

			expect((avatarImage as HTMLImageElement).src).toBe(
				getAvatarSource(BASE_USER_INFO.avatarHash, BASE_USER_INFO.username)
			);
		});

		it('should render avatar upload button', async () => {
			expect.hasAssertions();

			const { userForm, avatarForm } = await createValidatedForms();
			setupComponent(AccountTab, {
				props: {
					avatarForm,
					userForm,
					userInfo: BASE_USER_INFO
				}
			});

			const avatarUploadButton = screen.getByRole('button', { name: m.dark_smart_sheep_seek() });

			expect(avatarUploadButton).toBeInTheDocument();
		});

		it('should render name input field correctly', async () => {
			expect.hasAssertions();

			const { userForm, avatarForm } = await createValidatedForms();
			setupComponent(AccountTab, {
				props: {
					avatarForm,
					userForm,
					userInfo: BASE_USER_INFO
				}
			});

			expect(screen.getByText(m.registerName())).toBeInTheDocument();

			const nameInput = screen.getByPlaceholderText(BASE_USER_INFO.name);

			expect(nameInput).toBeInTheDocument();
			expect((nameInput as HTMLInputElement).value).toBe('');
		});

		it('should render save button correctly', async () => {
			expect.hasAssertions();

			const { userForm, avatarForm } = await createValidatedForms();
			setupComponent(AccountTab, {
				props: {
					avatarForm,
					userForm,
					userInfo: BASE_USER_INFO
				}
			});

			const saveButton = screen.getByRole('button', { name: m.save() });

			expect(saveButton).toBeInTheDocument();
			expect(saveButton).toHaveAttribute('formaction', '?/update');
			expect(saveButton).toHaveAttribute('type', 'submit');
		});

		it('should render logout button correctly', async () => {
			expect.hasAssertions();

			const { userForm, avatarForm } = await createValidatedForms();
			setupComponent(AccountTab, {
				props: {
					avatarForm,
					userForm,
					userInfo: BASE_USER_INFO
				}
			});

			const logoutButton = screen.getByRole('button', { name: m.profileLogout() });

			expect(logoutButton).toBeInTheDocument();
			expect(logoutButton).toHaveAttribute('formaction', '?/logout');
			expect(logoutButton).toHaveAttribute('type', 'submit');
		});

		it('should not show avatar upload dialog initially', async () => {
			expect.hasAssertions();

			const { userForm, avatarForm } = await createValidatedForms();
			setupComponent(AccountTab, {
				props: {
					avatarForm,
					userForm,
					userInfo: BASE_USER_INFO
				}
			});

			expect(screen.queryByLabelText(m.funny_simple_fireant_loop())).not.toBeInTheDocument();
		});
	});

	describe('interactions', () => {
		it('should open avatar upload dialog when clicking upload button', async () => {
			expect.hasAssertions();

			const { userForm, avatarForm } = await createValidatedForms();
			const { user } = setupComponent(AccountTab, {
				props: {
					avatarForm,
					userForm,
					userInfo: BASE_USER_INFO
				}
			});

			const avatarUploadButton = screen.getByTitle(m.dark_smart_sheep_seek());
			await user.click(avatarUploadButton);

			await waitFor(() => {
				expect(screen.getByLabelText(m.funny_simple_fireant_loop())).toBeVisible();
			});
		});
	});

	describe('form initialization', () => {
		it('should initialize form with pre-filled data', async () => {
			expect.hasAssertions();

			const initialFormData = { name: 'Pre-filled Name' };
			const { userForm } = await getValidatedForms(initialFormData);
			const { avatarForm } = await createValidatedForms();

			setupComponent(AccountTab, {
				props: {
					avatarForm,
					userForm,
					userInfo: BASE_USER_INFO
				}
			});

			const nameInput = screen.getByPlaceholderText(BASE_USER_INFO.name);

			expect((nameInput as HTMLInputElement).value).toBe(initialFormData.name);
		});

		it('should handle empty form data gracefully', async () => {
			expect.hasAssertions();

			const { userForm } = await getValidatedForms();
			const { avatarForm } = await createValidatedForms();

			setupComponent(AccountTab, {
				props: {
					avatarForm,
					userForm,
					userInfo: BASE_USER_INFO
				}
			});

			const nameInput = screen.getByPlaceholderText(BASE_USER_INFO.name);

			expect((nameInput as HTMLInputElement).value).toBe('');
		});
	});

	describe('error handling', () => {
		it('should handle invalid userInfo gracefully', async () => {
			expect.hasAssertions();

			const invalidUserInfo = { ...BASE_USER_INFO, username: '' };
			const { userForm, avatarForm } = await createValidatedForms();

			setupComponent(AccountTab, {
				props: {
					avatarForm,
					userForm,
					userInfo: invalidUserInfo
				}
			});

			// Should still render without crashing
			expect(screen.getByText(m.registerName())).toBeInTheDocument();
		});

		it('should handle missing avatar hash', async () => {
			expect.hasAssertions();

			const userInfoWithoutAvatar = { ...BASE_USER_INFO, avatarHash: undefined };
			const { userForm, avatarForm } = await createValidatedForms();

			setupComponent(AccountTab, {
				props: {
					avatarForm,
					userForm,
					userInfo: userInfoWithoutAvatar
				}
			});

			const avatarImage = screen.getByAltText('avatar');

			expect((avatarImage as HTMLImageElement).src).toBe(
				getAvatarSource('', BASE_USER_INFO.username)
			);
		});
	});
});
