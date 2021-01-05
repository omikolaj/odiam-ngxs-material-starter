import { AuthenticatorSetup } from 'app/core/models/2fa/authenticator-setup.model.2fa';
import { AuthenticatorSetupResult } from 'app/core/models/2fa/authenticator-setup-result.model.2fa';

export interface TwoFactorAuthenticationStateModel {
	authenticatorSetup: AuthenticatorSetup;
	authenticationSetupResult: AuthenticatorSetupResult;
	newRecoveryCodes: string[];
}
