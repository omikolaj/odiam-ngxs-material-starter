/**
 * Password reset model.
 */
export interface PasswordReset {
	/**
	 * User's new password.
	 */
	password: string;

	/**
	 * User's password reset token.
	 */
	passwordResetToken: string;
}
