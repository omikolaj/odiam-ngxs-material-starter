export interface DashboardStateModel {
	email: string;
	emailConfirmed: boolean;
	externalLogins: string[];
	twoFactorEnabled: boolean;
	hasAuthenticator: boolean;
	twoFactorClientRemembered: boolean;
	recoveryCodesLeft: string;
}
