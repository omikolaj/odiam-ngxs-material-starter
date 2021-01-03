import { TwoFactorConfigurationStatus } from './2fa/2fa-configuration-status.model';

export interface AccountDetails {
	email: string;
	emailConfirmed: boolean;
	externalLogins: string[];
	twoFactorEnabled: boolean;
	hasAuthenticator: boolean;
	twoFactorClientRemembered: boolean;
	recoveryCodesLeft: string;
	twoFactorConfigurationStatus: TwoFactorConfigurationStatus;
}
