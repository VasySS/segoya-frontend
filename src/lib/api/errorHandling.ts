import type { BackendError } from './openapi';

export async function getErrorFromResponse(response: Response): Promise<BackendError> {
	let responseJSON: BackendError | undefined;

	try {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		responseJSON = await response.json();
	} catch {
		responseJSON = undefined;
	}

	return {
		title: responseJSON?.title ?? 'Unknown error',
		status: response.status,
		detail: responseJSON?.detail ?? 'An unknown error has occurred'
	};
}
