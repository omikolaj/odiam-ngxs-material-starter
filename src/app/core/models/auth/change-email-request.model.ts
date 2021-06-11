/**
 * When user requests to change their email address. Server will take the new email address and generate a token.
 */
export interface ChangeEmailRequest {
	/**
	 * User's new email address.
	 */
	newEmail: string;

	/**
	 * User's current password used for authentication.
	 */
	password: string;
}
