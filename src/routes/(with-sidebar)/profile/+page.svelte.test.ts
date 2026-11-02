import { screen } from '@testing-library/svelte';
import { fetchBackend } from '#lib/api/base.js';
import { m } from '#paraglide/messages.js';
import { setupComponent } from '#tests/vitestSetup.js';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { avatarSchema, formSchema } from './(components)/(account-tab)/schema';
import ProfilePage from './+page.svelte';
import type { PageData } from './$types';

vi.mock(import('#lib/api/base.js'));

async function createData(): Promise<PageData> {
	return {
		jwtToken: 'initial-token',
		jwtPayload: {
			userID: 'user',
			username: 'username',
			name: 'Initial Name',
			sessionID: 'current',
			exp: 2_000_000_000
		},
		apiKeys: { yandex: '', google: '', seznam: '' },
		profileInfo: {
			id: 'user',
			username: 'username',
			name: 'Initial Name',
			avatarHash: '',
			registerDate: '2024-01-01T00:00:00Z',
			yandexConnected: true,
			discordConnected: false
		},
		sessions: [
			{
				userID: 'user',
				sessionID: 'current',
				refreshToken: '',
				ua: 'Mozilla/5.0 Chrome/120.0',
				browserLabel: 'Chrome 120.0',
				lastActive: '2024-01-01T00:00:00Z'
			}
		],
		connectedOAuth: [{ provider: 'yandex', createdAt: '2024-01-01T00:00:00Z' }],
		form: await superValidate(zod4(formSchema)),
		avatarForm: await superValidate(zod4(avatarSchema))
	};
}

describe('refreshed profile data', () => {
	// eslint-disable-next-line vitest/no-hooks
	afterEach(() => vi.clearAllMocks());

	it('updates account, sessions and OAuth props when server data changes', { timeout: 15_000 }, async () => {
		expect.hasAssertions();

		const data = await createData();
		const { user, rerender } = setupComponent(ProfilePage, { props: { data } });
		await rerender({
			data: {
				...data,
				profileInfo: { ...data.profileInfo, name: 'Refreshed Name' },
				connectedOAuth: [],
				sessions: []
			}
		});

		expect(screen.getByPlaceholderText('Refreshed Name')).toBeInTheDocument();

		await user.click(screen.getByRole('tab', { name: m.such_every_lion_adapt() }));
		await vi.dynamicImportSettled();
		await user.click(await screen.findByRole('button', { name: 'OAuth' }));

		expect(screen.queryByTestId('current-session-tooltip')).not.toBeInTheDocument();
		expect(screen.getByRole('form', { name: 'yandex-add' })).toBeInTheDocument();
	});

	it('uses the refreshed token when loading statistics', { timeout: 15_000 }, async () => {
		expect.hasAssertions();

		const data = await createData();
		vi.mocked(fetchBackend).mockResolvedValue({
			success: true,
			data: { total: 0, games: [] },
			headers: undefined
		});
		const { user, rerender } = setupComponent(ProfilePage, { props: { data } });
		await rerender({ data: { ...data, jwtToken: 'refreshed-token' } });
		await user.click(screen.getByRole('tab', { name: m.profileTabStats() }));
		await vi.dynamicImportSettled();
		await screen.findByText(m.playedGames());

		expect(fetchBackend).toHaveBeenCalledWith('refreshed-token', 'get', '/v1/singleplayer', {
			query: { page: 1, 'page-size': 10 }
		});
	});

	it('loads statistics when its tab is selected with the keyboard', { timeout: 15_000 }, async () => {
		expect.hasAssertions();

		const data = await createData();
		vi.mocked(fetchBackend).mockResolvedValue({
			success: true,
			data: { total: 0, games: [] },
			headers: undefined
		});
		const { user } = setupComponent(ProfilePage, { props: { data } });

		expect(fetchBackend).not.toHaveBeenCalled();
		expect(screen.queryByText(m.playedGames())).not.toBeInTheDocument();

		screen.getByRole('tab', { name: m.profileTabAccount() }).focus();
		await user.keyboard('{End}');
		await vi.dynamicImportSettled();
		await screen.findByText(m.playedGames());

		expect(fetchBackend).toHaveBeenCalledWith('initial-token', 'get', '/v1/singleplayer', {
			query: { page: 1, 'page-size': 10 }
		});
	});
});
