/**
 * Confirm email model.
 */
export interface ConfirmEmail {
	/**
	 * Email to confirm.
	 */
	email: string;

	/**
	 * Email confirmation token.
	 */
	token: string;
}
