import { AccountGeneralDetails } from 'app/core/models/account-general-details.model';

/**
 * Set account genral details.
 */
export class SetAccountGeneralDetails {
	/**
	 * Type of action.
	 */
	static readonly type = '[General] Set Account General Details';

	/**
	 * Creates an instance of set account genral details.
	 * @param payload
	 */
	constructor(public payload: AccountGeneralDetails) {}
}
