import { TwoFactorAuthenticationStatus } from './2fa-status.enum';

/**
 * Authenticator setup result model.
 */
export interface AuthenticatorSetupResultModel {
	/**
	 * Result of the authenticator setup operation.
	 */
	status: TwoFactorAuthenticationStatus;

	recoveryCodes?: string[];
}
