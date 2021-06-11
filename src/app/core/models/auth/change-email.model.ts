/**
 * Change email model. This is used by the server to update the database with the new email.
 */
export interface ChangeEmail {
	/**
	 * User's new email.
	 */
	newEmail: string;

	/**
	 * Change email token generated by the server.
	 */
	token: string;
}
