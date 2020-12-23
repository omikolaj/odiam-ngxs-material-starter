import { TwoFactorAuthenticationStatus } from './2fa-status.enum';

/**
 * Disable2 fa result model.
 */
export interface Disable2FaResultModel {
	/**
	 * Result of disabling 2fa.
	 */
	status: TwoFactorAuthenticationStatus;
}
