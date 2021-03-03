import { AccessToken } from './access-token.model';

/**
 * Init session result model
 */
export interface InitSessionResult {
	/**
	 * Whether user session was authenticated or not.
	 */
	succeeded: boolean;

	/**
	 * If user session was authenticated, this is user's access token.
	 */
	accessToken?: AccessToken;
}
