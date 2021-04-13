import { UserRecoveryCodes } from './user-recovery-codes.model';

/**
 * Authenticator setup result model.
 */
export interface TwoFactorAuthenticationSetupResult {
	/**
	 * User recovery codes.
	 */
	recoveryCodes: UserRecoveryCodes;

	status: 'None' | 'Succeeded' | 'Failed';
}
