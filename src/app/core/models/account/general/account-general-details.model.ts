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
	 * Whether user's request to change email has been sent without errors.
	 */
	changeEmailRequestSent: boolean;
}
