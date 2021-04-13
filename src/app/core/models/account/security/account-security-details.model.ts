import { UserRecoveryCodes } from 'app/core/models/account/security/user-recovery-codes.model';

/**
 * Account security details model.
 */
export interface AccountSecurityDetails {
	/**
	 * Whether user has setup two factor authentication before.
	 */
	hasAuthenticator: boolean;

	/**
	 * If two factor authentication is enabled/disabled.
	 */
	twoFactorEnabled: boolean;

	/**
	 * Number of recovery codes left.
	 */
	recoveryCodesLeft: number;

	/**
	 *  Recovery codes for this user.
	 */
	recoveryCodes: UserRecoveryCodes;
}
