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

/**
 * Whether user's email change request completed without errors.
 */
export class EmailChangeCompleted {
	/**
	 * Type of action.
	 */
	static readonly type = '[General] Email Change Completed';

	/**
	 * Creates an instance of email change completed.
	 * @param payload
	 */
	constructor(public payload: { emailChangeCompleted: boolean }) {}
}
