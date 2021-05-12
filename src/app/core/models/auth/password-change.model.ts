/**
 * Password change model.
 */
export interface PasswordChange {
	/**
	 * User's old password.
	 */
	currentPassword: string;

	/**
	 * User's new password.
	 */
	newPassword: string;

	/**
	 * User's confirm password.
	 */
	confirmPassword: string;
}
