import { TwoFactorAuthenticationSetupResult } from 'app/views/account/security-container/two-factor-authentication/models/two-factor-authentication-setup-result.model';

/**
 * Two factor authentication setup wizard model for the store.
 */
export interface TwoFactorAuthenticationStateModel {
	sharedKey: string;
	authenticatorUri: string;
	authenticatorResult: TwoFactorAuthenticationSetupResult;
}
