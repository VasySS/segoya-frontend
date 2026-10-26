import { fetchBackend } from '#lib/api/base.js';
import { actions as lobby } from '#routes/(with-sidebar)/lobbies/new/+page.server.js';
import { actions as singleplayer } from '#routes/(with-sidebar)/quick-game/+page.server.js';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock(import('#lib/api/base.js'));

function event(rounds: string): Parameters<NonNullable<typeof singleplayer.default>>[0] {
	const data = new FormData();
	const fields = {
		provider: 'google',
		rounds,
		movementAllowed: 'true',
		timerEnabled: 'true',
		timerSeconds: '30',
		maxPlayers: '10',
		private: 'false'
	};

	for (const [key, value] of Object.entries(fields)) data.set(key, value);

	return {
		locals: {
			jwtToken: 'local-token',
			jwtPayload: { userID: '0199027e-ade6-784d-9d43-cc9c776a6943' }
		},
		request: new Request('https://example.com/quick-game', { method: 'POST', body: data })
	} as Parameters<NonNullable<typeof singleplayer.default>>[0];
}

describe.each([
	{ name: 'singleplayer', action: singleplayer.default, endpoint: '/v1/singleplayer' },
	{ name: 'new lobby', action: lobby.default, endpoint: '/v1/lobbies' }
])('$name area submissions', ({ action, endpoint }) => {
	// eslint-disable-next-line vitest/no-hooks -- Each action gets an independent backend mock.
	afterEach(() => vi.resetAllMocks());

	it('rejects invalid settings before creating a game or lobby', async () => {
		expect.hasAssertions();

		const result = await action?.(event('0'));

		expect(result).toMatchObject({ status: 400, data: { form: { valid: false } } });
		expect(fetchBackend).not.toHaveBeenCalled();
	});

	it('forwards the default area and preserves backend errors at form level', async () => {
		expect.hasAssertions();

		vi.mocked(fetchBackend).mockResolvedValueOnce({
			success: false,
			error: { title: 'Rejected', status: 400, detail: 'Area cannot start this game' }
		});
		const result = await action?.(event('5'));

		expect(vi.mocked(fetchBackend).mock.calls[0]).toMatchObject([
			'local-token',
			'post',
			endpoint,
			{ body: { playArea: { type: 'all' }, rounds: 5 } }
		]);
		expect(result).toMatchObject({
			status: 400,
			data: { form: { message: 'Area cannot start this game' } }
		});
	});
});
