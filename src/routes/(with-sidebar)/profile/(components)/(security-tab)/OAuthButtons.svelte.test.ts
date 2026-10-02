import { screen } from '@testing-library/svelte';
import { fetchBackend } from '#lib/api/base.js';
import { m } from '#paraglide/messages.js';
import { setupComponent } from '#tests/vitestSetup.js';
import { refreshAll } from '$app/navigation';
import { toast } from 'svelte-sonner';
import { afterEach, describe, expect, it, vi } from 'vitest';

import DiscordButton from './DiscordButton.svelte';
import YandexButton from './YandexButton.svelte';

vi.mock(import('#lib/api/base.js'));
vi.mock(import('$app/navigation'), () => ({ refreshAll: vi.fn<typeof refreshAll>() }));

describe.each([
	{ provider: 'yandex', component: YandexButton, endpoint: '/v1/auth/yandex' },
	{ provider: 'discord', component: DiscordButton, endpoint: '/v1/auth/discord' }
] as const)('$provider disconnection', ({ component, endpoint }) => {
	// eslint-disable-next-line vitest/no-hooks
	afterEach(() => vi.clearAllMocks());

	it('refreshes server data after success', async () => {
		expect.hasAssertions();

		vi.mocked(fetchBackend).mockResolvedValue({
			success: true,
			data: undefined,
			headers: undefined
		});
		const { user } = setupComponent(component, {
			props: { jwtToken: 'token', oauthCreatedAt: '2024-01-01T00:00:00Z' }
		});
		await user.click(screen.getByRole('button', { name: m.super_each_bison_find() }));

		expect(fetchBackend).toHaveBeenCalledWith('token', 'delete', endpoint);
		expect(refreshAll).toHaveBeenCalledExactlyOnceWith();
		expect(toast.error).not.toHaveBeenCalled();
	});

	it('keeps the connected account and reports a backend failure', async () => {
		expect.hasAssertions();

		vi.mocked(fetchBackend).mockResolvedValue({
			success: false,
			error: { status: 500, title: 'Error', detail: 'Disconnection failed' }
		});
		const { user } = setupComponent(component, {
			props: { jwtToken: 'token', oauthCreatedAt: '2024-01-01T00:00:00Z' }
		});
		await user.click(screen.getByRole('button', { name: m.super_each_bison_find() }));

		expect(toast.error).toHaveBeenCalledExactlyOnceWith('Disconnection failed');
		expect(refreshAll).not.toHaveBeenCalled();
		expect(screen.getByRole('button', { name: m.super_each_bison_find() })).toBeInTheDocument();
	});
});
