import { AccountSecurityDetails } from 'app/core/models/account-security-details.model';

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
