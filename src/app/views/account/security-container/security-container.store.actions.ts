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
 * Set account security details.
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
 * Set account security details.
 */
export class UpdateRecoveryCodes {
	/**
	 * Type of action.
	 */
	static readonly type = '[Security] Updates User Recovery Codes';

	/**
	 * Creates an instance that updates two factor authentication settings.
	 * @param payload
	 */
	constructor(public payload: UserRecoveryCodes) {}
}
