/**
 * Api's access token.
 */
export interface AccessToken {
	/**
	 * Json web token.
	 */
	access_token: string;

	/**
	 * Date time in unix epoch when access token expires.
	 */
	expires_in: number;
}
