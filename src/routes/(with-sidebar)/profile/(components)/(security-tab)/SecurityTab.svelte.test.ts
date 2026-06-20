import { screen, waitFor } from '@testing-library/svelte'; // eslint-disable-line import/named
import { fetchBackend } from '$lib/api/base';
import type { AuthProvider } from '$lib/api/openapi';
import { APIKeys } from '$lib/constants/enums';
import type { JwtPayload } from '$lib/types/auth';
import { m } from '$paraglide/messages.js';
import { setupComponent } from '$tests/vitestSetup';
import { toast } from 'svelte-sonner';
import { afterEach, describe, expect, it, vi } from 'vitest';

import SecurityTab from './SecurityTab.svelte';

vi.mock(import('$lib/api/base'));

const mockSessions = [
	{
		userID: 1,
		sessionID: 'current',
		ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0',
		lastActive: '2024-01-01T00:00:00Z'
	},
	{
		userID: 1,
		sessionID: 'other',
		ua: 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Mobile Safari/537.36',
		lastActive: '2024-01-02T00:00:00Z'
	}
];

const baseProps = {
	sessions: mockSessions,
	connectedOAuth: [] as AuthProvider[],
	jwtToken: 'test-token',
	jwtPayload: { sessionID: 'current' } as JwtPayload,
	apiKeys: { yandex: '', google: '', seznam: '' }
};

describe('tests for SecurityTab component', () => {
	// eslint-disable-next-line vitest/no-hooks
	afterEach(() => {
		vi.clearAllMocks();
		vi.restoreAllMocks();
	});

	it('should render all sections correctly', () => {
		expect.hasAssertions();

		setupComponent(SecurityTab, { props: baseProps });

		// Card header
		expect(screen.getByText(m.such_every_lion_adapt())).toBeInTheDocument();

		// Accordion sections
		expect(screen.getByText(m.dry_smart_spider_zap())).toBeInTheDocument();
		expect(screen.getByText('OAuth')).toBeInTheDocument();
		expect(screen.getByText('API')).toBeInTheDocument();

		// Sessions list
		expect(screen.getAllByTitle(m.super_each_bison_find())).toHaveLength(1);
		expect(screen.getByText('Chrome 120.0, Windows NT 10.0')).toBeInTheDocument();
	});

	it('should highlight the current session', async () => {
		expect.hasAssertions();

		const { user } = setupComponent(SecurityTab, { props: baseProps });

		await user.pointer({ target: screen.getByTestId('current-session-tooltip') });
		await waitFor(() => {
			expect(screen.getByText(m.curly_maroon_elk_fade())).toBeInTheDocument();
		});
	});

	it('should allow deleting the other session', async () => {
		expect.hasAssertions();

		vi.mocked(fetchBackend).mockResolvedValue({ success: true, data: {}, headers: {} });

		const { user } = setupComponent(SecurityTab, { props: baseProps });
		const deleteButton = screen.getByTitle(m.super_each_bison_find());

		await user.click(deleteButton);

		expect(fetchBackend).toHaveBeenCalledWith('test-token', 'delete', '/v1/auth/sessions/{id}', {
			path: { id: 'other' }
		});
	});

	it('should render OAuth connections', () => {
		expect.hasAssertions();

		const props = {
			...baseProps,
			connectedOAuth: [{ provider: 'yandex', createdAt: '2024-01-01' }]
		};

		setupComponent(SecurityTab, { props });

		expect(screen.getByText(/^Yandex$/)).toBeInTheDocument();
		expect(screen.getByText(/^Discord$/)).toBeInTheDocument();
		expect(
			screen.getByText(`(${new Date('2024-01-01').toLocaleDateString()})`)
		).toBeInTheDocument();
	});

	describe('tests for API Keys Section', () => {
		it('should show error toast on Yandex API save failure and success toast otherwise', async () => {
			expect.hasAssertions();

			const { user } = setupComponent(SecurityTab, { props: baseProps });

			const inputField = screen.getByPlaceholderText('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee');
			await user.type(inputField, 'test-key');

			vi.spyOn(globalThis, 'fetch')
				.mockRejectedValueOnce(new Error('Yandex API failed'))
				.mockResolvedValueOnce(Response.json({ statusCode: 200 }, { status: 200 }))
				.mockResolvedValueOnce(new Response(undefined, { status: 200 }));

			vi.spyOn(toast, 'error').mockImplementationOnce(vi.fn());

			await user.click(screen.getByTitle(m.ago_grassy_warbler_lead()));

			await waitFor(() => {
				expect(toast.error).toHaveBeenCalled();
			});

			vi.spyOn(toast, 'success').mockImplementationOnce(vi.fn());

			await user.click(screen.getByTitle(m.ago_grassy_warbler_lead()));

			await waitFor(() => {
				expect(fetch).toHaveBeenCalledWith(
					expect.stringMatching(/^https:\/\/geocode-maps\.yandex\.ru\/1\.x/)
				);
			});

			await waitFor(() => {
				expect(fetch).toHaveBeenCalledWith(`/api/cookies/${APIKeys.YANDEX}`, expect.anything());
			});

			await waitFor(() => {
				expect(toast.success).toHaveBeenCalledWith(m.sea_smug_crow_nudge());
			});
		});

		it('should show error toast on Seznam API save failure and success toast otherwise', async () => {
			expect.hasAssertions();

			vi.spyOn(globalThis, 'fetch')
				.mockRejectedValueOnce(new Error('Seznam API failed'))
				.mockResolvedValueOnce(Response.json({}, { status: 200 }))
				.mockResolvedValueOnce(new Response(undefined, { status: 200 }));
			const { user } = setupComponent(SecurityTab, { props: baseProps });

			const inputField = screen.getByPlaceholderText('aBcdEf...');
			await user.type(inputField, 'test-key');

			vi.spyOn(toast, 'error').mockImplementation(vi.fn());
			await user.click(screen.getByTitle(m.house_same_bullock_lend()));

			await waitFor(() => {
				expect(toast.error).toHaveBeenCalled();
			});

			vi.spyOn(toast, 'success').mockImplementation(vi.fn());
			await user.click(screen.getByTitle(m.house_same_bullock_lend()));

			await waitFor(() => {
				expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/^https:\/\/api\.mapy\.cz\/v1/));
			});

			await waitFor(() => {
				expect(fetch).toHaveBeenCalledWith(`/api/cookies/${APIKeys.SEZNAM}`, expect.anything());
			});

			await waitFor(() => {
				expect(toast.success).toHaveBeenCalledWith(m.sea_smug_crow_nudge());
			});
		});

		it('should show error toast on Google API save failure and success toast otherwise', async () => {
			expect.hasAssertions();

			vi.spyOn(globalThis, 'fetch')
				.mockRejectedValueOnce(new Error('Google API failed'))
				.mockResolvedValueOnce(Response.json({ status: 'OK' }, { status: 200 }))
				.mockResolvedValueOnce(new Response(undefined, { status: 200 }));

			const { user } = setupComponent(SecurityTab, { props: baseProps });

			const inputField = screen.getByPlaceholderText('AIza...');
			await user.type(inputField, 'test-key');

			vi.spyOn(toast, 'error').mockImplementation(vi.fn());
			await user.click(screen.getByTitle(m.raw_funny_bee_grin()));

			await waitFor(() => {
				expect(toast.error).toHaveBeenCalled();
			});

			vi.spyOn(toast, 'success').mockImplementation(vi.fn());
			await user.click(screen.getByTitle(m.raw_funny_bee_grin()));

			await waitFor(() => {
				expect(fetch).toHaveBeenCalledWith(
					expect.stringMatching(/^https:\/\/maps\.googleapis\.com\/maps\/api/)
				);
			});

			await waitFor(() => {
				expect(fetch).toHaveBeenCalledWith(`/api/cookies/${APIKeys.GOOGLE}`, expect.anything());
			});

			await waitFor(() => {
				expect(toast.success).toHaveBeenCalledWith(m.sea_smug_crow_nudge());
			});
		});
	});
});
