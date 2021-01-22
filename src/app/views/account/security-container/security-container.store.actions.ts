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
export class UpdateAccountSecurityDetailsSettings {
	/**
	 * Type of action.
	 */
	static readonly type = '[Security] Updates Account Security Details Settings';

	/**
	 * Creates an instance that updates account security details.
	 * @param payload
	 */
	constructor(public payload: AccountSecurityDetails) {}
}

/**
 * Disable two factor authentication.
 */
export class ResetAccountSecuritySettings {
	/**
	 * Type of action.
	 */
	static readonly type = '[Security] Reset Account Security Settings';
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
	 * Creates an instance that updates recovery codes.
	 * @param payload
	 */
	constructor(public payload: UserRecoveryCodes) {}
}
