import { AccessToken } from './access-token.model';

/**
 * Result of renew access token operation.
 */
export interface RenewAccessTokenResult {
	/**
	 * Whether the renewal was successful
	 */
	succeeded: boolean;

	/**
	 * New access token
	 */
	accessToken: AccessToken;
}
