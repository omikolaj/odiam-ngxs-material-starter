/**
 * Password reset model.
 */
export interface PasswordReset {
	/**
	 * User's password.
	 */
	email: string;

	/**
	 * Users' new password.
	 */
	password: string;
}
