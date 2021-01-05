import { AuthenticatorSetupResult } from 'app/core/models/2fa/authenticator-setup-result.model.2fa';

/**
 * Two factor authentication setup wizard model for the store.
 */
export interface TwoFactorAuthentication2 {
	sharedKey: string;
	authenticatorUri: string;
	authenticatorResult: AuthenticatorSetupResult;
}
