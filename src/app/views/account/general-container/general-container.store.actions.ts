import { AccountGeneralDetails } from 'app/core/models/account/general/account-general-details.model';

/**
 * Sets account genral details for the logged in user.
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
