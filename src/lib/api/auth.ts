import { BACKEND_BASE_URL } from './base';

export const authBaseURL = 'auth';

export const accessCookieName = 'accessToken';
export const refreshCookieName = 'refreshToken';

export const DISCORD_OAUTH_LOGIN_URL = `${BACKEND_BASE_URL}/v1/${authBaseURL}/discord/login`;
export const YANDEX_OAUTH_LOGIN_URL = `${BACKEND_BASE_URL}/v1/${authBaseURL}/yandex/login`;

export async function newYandexOAuth(jwt: string): Promise<Response> {
	const response = await fetch(`${BACKEND_BASE_URL}/v1/${authBaseURL}/yandex/new`, {
		method: 'GET',
		redirect: 'manual',
		headers: { Authorization: `Bearer ${jwt}` }
	});

	if (response.status !== 307) {
		throw new Error('status is not 307');
	}

	const location = response.headers.get('Location');
	if (!location) {
		throw new Error('no Location header in response');
	}

	return response;
}

export async function newDiscordOAuth(jwt: string): Promise<Response> {
	const response = await fetch(`${BACKEND_BASE_URL}/v1/${authBaseURL}/discord/new`, {
		method: 'GET',
		redirect: 'manual',
		headers: { Authorization: `Bearer ${jwt}` }
	});

	if (response.status !== 307) {
		throw new Error('status is not 307');
	}

	const location = response.headers.get('Location');
	if (!location) {
		throw new Error('no Location header in response');
	}

	return response;
}
