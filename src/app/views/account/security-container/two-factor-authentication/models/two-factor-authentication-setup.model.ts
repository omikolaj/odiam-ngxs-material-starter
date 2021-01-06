/**
 * Setup authenticator model.
 */
export interface TwoFactorAuthenticationSetup {
	sharedKey: string;
	authenticatorUri: string;
}
