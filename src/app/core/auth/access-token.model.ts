/**
 * Jwt access token.
 */
export interface AccessToken {
	access_token: string;
	refresh_token: string;
	expires_in: number;
}
