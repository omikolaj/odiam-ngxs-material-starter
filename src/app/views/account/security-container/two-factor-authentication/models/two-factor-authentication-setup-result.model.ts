import { TwoFactorAuthenticationStatus } from './two-factor-authentication-status.enum';

/**
 * Authenticator setup result model.
 */
export interface TwoFactorAuthenticationSetupResult {
	/**
	 * Result of the authenticator setup operation.
	 */
	status: TwoFactorAuthenticationStatus;

	recoveryCodes: string[];
}
