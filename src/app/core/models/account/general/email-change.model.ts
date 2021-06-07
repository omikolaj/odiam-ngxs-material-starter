/**
 * Email change model.
 */
export interface EmailChange {
	/**
	 * User's current email.
	 */
	email: string;

	/**
	 * User's new email.
	 */
	newEmail: string;

	/**
	 * User's password.
	 */
	password: string;
}
