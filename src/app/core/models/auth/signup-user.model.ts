/**
 * Signup user model.
 */
export interface SignupUser {
	/**
	 * New user's email.
	 */
	email: string;

	/**
	 * New user's password.
	 */
	password: string;

	/**
	 * New user's confirmed password.
	 */
	confirmPassword: string;
}
