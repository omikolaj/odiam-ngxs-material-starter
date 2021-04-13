/**
 * Setup authenticator model.
 */
export interface TwoFactorAuthenticationSetup {
	/**
	 * Shared key used to setup authenticator app.
	 */
	sharedKey: string;

	/**
	 * Uri used to display QR bar code.
	 */
	authenticatorUri: string;
}
