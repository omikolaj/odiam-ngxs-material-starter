import { AccessToken } from './access-token.model';

/**
 * Represents the authentication response from the server.
 */
export interface AuthResponse {
	/**
	 * Whether authentication was successful.
	 */
	isAuthSuccessful: boolean;

	/**
	 * Users access token.
	 */
	accessToken: AccessToken;

	/**
	 * Whether two step verification is required.
	 */
	is2StepVerificationRequired: boolean;

	/**
	 * The type of verification provider to use. Security code could be sent via email, authenticator app, sms etc.
	 */
	provider: string;
}
