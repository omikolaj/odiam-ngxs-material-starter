/**
 * Signin user model.
 */
export interface SigninUser {
	/**
	 * User's email;
	 */
	email: string;

	/**
	 * User's password.
	 */
	password: string;

	/**
	 * Whether user wants browser to remember their email.
	 */
	rememberMe: boolean;
}
