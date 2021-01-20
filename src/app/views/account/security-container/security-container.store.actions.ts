import { AccountSecurityDetails } from 'app/core/models/account-security-details.model';
import { UserRecoveryCodes } from './models/user-recovery-codes.model';

/**
 * Set account security details.
 */
export class SetAccountSecurityDetails {
	/**
	 * Type of action.
	 */
	static readonly type = '[Security] Set Account Security Details';

	/**
	 * Creates an instance of set account security details.
	 * @param payload
	 */
	constructor(public payload: AccountSecurityDetails) {}
}

/**
 * Update account security details.
 */
export class UpdateTwoFactorAuthenticationSettings {
	/**
	 * Type of action.
	 */
	static readonly type = '[Security] Updates Two Factor Authentication Settings';

	/**
	 * Creates an instance that updates two factor authentication settings.
	 * @param payload
	 */
	constructor(public payload: AccountSecurityDetails) {}
}

/**
 * Disable two factor authentication.
 */
export class DisableTwoFactorAuthentication {
	/**
	 * Type of action.
	 */
	static readonly type = '[Security] Disables Two Factor Authentication';
}

/**
 * Updates recovery codes.
 */
export class UpdateRecoveryCodes {
	/**
	 * Type of action.
	 */
	static readonly type = '[Security] Updates User Recovery Codes';

	/**
	 * Creates an instance of that updates recovery codes.
	 * @param payload
	 */
	constructor(public payload: UserRecoveryCodes) {}
}
