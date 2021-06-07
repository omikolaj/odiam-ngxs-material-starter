/**
 * Account general details model.
 */
export interface AccountGeneralDetails {
	/**
	 * User's email.
	 */
	email: string;

	/**
	 * Whether user's email is verified or not.
	 */
	verified: boolean;

	/**
	 * Whether user's email change request completed without errors.
	 */
	emailChangeCompleted: boolean;
}
