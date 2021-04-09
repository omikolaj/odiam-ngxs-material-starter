/**
 * Authenticator verification code model.
 */
export interface TwoFactorAuthenticationVerificationCode {
	/**
	 *  Verification code entered in by the user.
	 */
	code: string;

	/**
	 * Type of provider used for verification. Once user had already set up two factor authentication, this specifies if user set it up via authenticator app, email, sms etc.
	 */
	provider?: string;

	/**
	 * User's email.
	 */
	email?: string;
}
