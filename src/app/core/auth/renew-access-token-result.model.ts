import { AccessTokenModel } from './access-token.model';

/**
 * Result of renew access token operation.
 */
export interface RenewAccessTokenModelResult {
	/**
	 * Whether the renewal was successful
	 */
	succeeded: boolean;

	/**
	 * New access token
	 */
	AccessTokenModel: AccessTokenModel;
}
