import { BACKEND_BASE_URL } from './base';

export const usersBaseURL = 'users';

export async function updateUserAvatar(jwt: string, formData: FormData): Promise<Response> {
	const response = await fetch(`${BACKEND_BASE_URL}/v1/${usersBaseURL}/avatar`, {
		method: 'PUT',
		headers: {
			Authorization: `Bearer ${jwt}`
		},
		body: formData
	});

	if (!response.ok) {
		throw new Error(await response.text());
	}

	return response;
}
