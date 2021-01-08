import { TwoFactorAuthenticationSetup } from 'app/views/account/security-container/two-factor-authentication/models/two-factor-authentication-setup.model';
import { TwoFactorAuthenticationSetupResult } from 'app/views/account/security-container/two-factor-authentication/models/two-factor-authentication-setup-result.model';

/**
 * Setup two factor authentication.
 */
export class SetupTwoFactorAuthentication {
	/**
	 * Type of action.
	 */
	static readonly type = '[2fa] Setup Two Factor Authentication';
	/**
	 * Creates an instance of setup two factor authentication.
	 * @param payload
	 */
	constructor(public payload: TwoFactorAuthenticationSetup) {}
}

/**
 * Result of verification process for setting up 2fa.
 */
export class AuthenticatorVerificationResult {
	/**
	 * Type of action.
	 */
	static readonly type = '[2fa] Authenticator Verification Result';

	/**
	 * Creates an instance of authenticator verification result.
	 * @param payload
	 */
	constructor(public payload: TwoFactorAuthenticationSetupResult) {}
}

/**
 * Disables two factor authentication.
 */
export class Disable2Fa {
	/**
	 * Type of action.
	 */
	static readonly type = '[2fa] Disable Two Factor Authentication';
}
