import { UserRecoveryCodes } from './user-recovery-codes.model';

/**
 * Authenticator setup result model.
 */
export interface TwoFactorAuthenticationSetupResult {
	/**
	 * User recovery codes.
	 */
	recoveryCodes: UserRecoveryCodes;

	/**
	 * Result status of the setup operation.
	 */
	status: 'None' | 'Succeeded' | 'Failed';
}
