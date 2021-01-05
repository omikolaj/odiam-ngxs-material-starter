import { TwoFactorAuthenticationStatus } from './2fa-status.enum';

/**
 * Authenticator setup result model.
 */
export interface AuthenticatorSetupResult {
	/**
	 * Result of the authenticator setup operation.
	 */
	status: TwoFactorAuthenticationStatus;

	recoveryCodes: string[];
}
