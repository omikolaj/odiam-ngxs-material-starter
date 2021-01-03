import { TwoFactorConfigurationStatus } from 'app/core/models/2fa/2fa-configuration-status.model';

export interface AccountStateModel {
	email: string;
	emailConfirmed: boolean;
	externalLogins: string[];
	twoFactorEnabled: boolean;
	hasAuthenticator: boolean;
	twoFactorClientRemembered: boolean;
	recoveryCodesLeft: string;
	twoFactorConfigurationStatus: TwoFactorConfigurationStatus;
}
