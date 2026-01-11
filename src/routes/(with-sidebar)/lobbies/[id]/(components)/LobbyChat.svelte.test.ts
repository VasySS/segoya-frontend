import { screen } from '@testing-library/svelte'; // eslint-disable-line import/named
import { m } from '$paraglide/messages.js';
import { setupComponent } from '$tests/vitestSetup';
import { describe, expect, it, vi } from 'vitest';

import LobbyChat from './LobbyChat.svelte';

class MockLobbyWebSocket {
	sendChatMessage = vi.fn();
}

describe('tests for LobbyChat component', () => {
	const mockLobbyWS = new MockLobbyWebSocket();
	const username = 'testuser';
	const baseProps = {
		lobbyWS: mockLobbyWS,
		username
	};

	it('renders input field and send button', () => {
		expect.hasAssertions();

		setupComponent(LobbyChat, { props: baseProps });

		expect(screen.getByPlaceholderText(m.hour_cool_rat_scold())).toBeInTheDocument();
		expect(screen.getByTitle(m.bald_loved_millipede_chop())).toBeInTheDocument();
	});

	it('sends message when Enter is pressed', async () => {
		expect.hasAssertions();

		const { user } = setupComponent(LobbyChat, { props: baseProps });
		const input = screen.getByPlaceholderText(m.hour_cool_rat_scold());
		const testMessage = 'Hello world';

		await user.type(input, testMessage + '{enter}');

		expect(mockLobbyWS.sendChatMessage).toHaveBeenCalledWith(username, testMessage);
		expect(input).toHaveValue('');
	});

	it('sends message when send button is clicked', async () => {
		expect.hasAssertions();

		const { user } = setupComponent(LobbyChat, { props: baseProps });
		const input = screen.getByPlaceholderText(m.hour_cool_rat_scold());
		const button = screen.getByTitle(m.bald_loved_millipede_chop());
		const testMessage = 'Test message';

		await user.type(input, testMessage);
		await user.click(button);

		expect(mockLobbyWS.sendChatMessage).toHaveBeenCalledWith(username, testMessage);
		expect(input).toHaveValue('');
	});

	it('clears input after sending message', async () => {
		expect.hasAssertions();

		const { user } = setupComponent(LobbyChat, { props: baseProps });
		const input = screen.getByPlaceholderText(m.hour_cool_rat_scold());

		await user.type(input, 'Test message');
		await user.click(screen.getByTitle(m.bald_loved_millipede_chop()));

		expect(input).toHaveValue('');
	});
});
