import { AuthenticatorSetupModel } from 'app/core/models/2fa/authenticator-setup.model.2fa';
import { AuthenticatorSetupResultModel } from 'app/core/models/2fa/authenticator-setup-result-model.2fa';

export interface TwoFactorAuthenticationStateModel {
	authenticatorSetup: AuthenticatorSetupModel;
	authenticationSetupResult: AuthenticatorSetupResultModel;
	newRecoveryCodes: string[];
}
