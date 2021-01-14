export interface AccountStateModel {
	email: string;
	emailConfirmed: boolean;
	twoFactorEnabled: boolean;
	hasAuthenticator: boolean;
	twoFactorClientRemembered: boolean;
	recoveryCodesLeft: string;
}
