/**
 * Password change model.
 */
export interface PasswordChange {
	/**
	 * The id of user changing the password.
	 */
	userId: string;

	/**
	 * User's old password.
	 */
	oldPassword: string;

	/**
	 * User's new password.
	 */
	newPassword: string;
}
