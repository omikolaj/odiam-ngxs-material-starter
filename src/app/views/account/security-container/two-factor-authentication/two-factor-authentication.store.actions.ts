import { TwoFactorAuthenticationSetup } from 'app/views/account/security-container/two-factor-authentication/models/two-factor-authentication-setup.model';
import { TwoFactorAuthenticationSetupResult } from 'app/views/account/security-container/two-factor-authentication/models/two-factor-authentication-setup-result.model';

/**
 * Setup two factor authentication.
 */
export class SetupTwoFactorAuthentication {
	/**
	 * Type of action.
	 */
	static readonly type = '[2fa Setup] Setup Two Factor Authentication';
	/**
	 * Creates an instance of setup two factor authentication.
	 * @param payload
	 */
	constructor(public payload: TwoFactorAuthenticationSetup) {}
}

/**
 * Result of verification process for setting up two factor authentication.
 */
export class AuthenticatorVerificationResult {
	/**
	 * Type of action.
	 */
	static readonly type = '[2fa Setup] Authenticator Verification Result';

	/**
	 * Creates an instance of authenticator verification result.
	 * @param payload
	 */
	constructor(public payload: TwoFactorAuthenticationSetupResult) {}
}

/**
 * Resets two factor authentication setup wizard to defaults.
 */
export class Reset2faSetupWizard {
	/**
	 * Type of action.
	 */
	static readonly type = '[2fa Setup] Reset Two Factor Authentication Setup';
}
