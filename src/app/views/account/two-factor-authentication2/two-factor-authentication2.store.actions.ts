import { AuthenticatorSetup } from 'app/core/models/2fa/authenticator-setup.model.2fa';

/**
 * Setup two factor authentication.
 */
export class SetupTwoFactorAuthentication {
	/**
	 * Type of action.
	 */
	static readonly type = '[TwoFactorAuthentication] Setup 2Fa Auth';
	/**
	 * Creates an instance of setup two factor authentication.
	 * @param payload
	 */
	constructor(public payload: AuthenticatorSetup) {}
}
