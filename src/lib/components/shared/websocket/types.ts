export interface WebSocketInputMessage {
	type: string;
	payload: unknown;
}

export interface WebSocketOutputMessage {
	type: string;
	payload?: unknown;
}

export interface WSError extends WebSocketInputMessage {
	type: 'error';
	payload: {
		message: string;
	};
}
