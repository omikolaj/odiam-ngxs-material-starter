/**
 * User's two factor authentication recovery code model.
 */
export interface TwoFactorRecoveryCode {
	/**
	 * Recovery code.
	 */
	code: string;

	/**
	 * User's email.
	 */
	email: string;
}
