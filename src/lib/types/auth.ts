export interface JwtPayload {
	userID: string;
	username: string;
	name: string;
	sessionID: string;
	exp: number;
}
