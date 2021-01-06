import { TwoFactorAuthenticationStatus } from './two-factor-authentication-status.enum';

/**
 * Disable2 fa result model.
 */
export interface Disable2FaResult {
	/**
	 * Result of disabling 2fa.
	 */
	status: TwoFactorAuthenticationStatus;
}
