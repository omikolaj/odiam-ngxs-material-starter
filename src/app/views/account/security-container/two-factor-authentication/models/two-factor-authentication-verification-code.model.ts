/**
 * Authenticator verification code model.
 */
export interface TwoFactorAuthenticationVerificationCode {
	/**
	 *  Verification code entered in by the user.
	 */
	verificationCode: string;
}
