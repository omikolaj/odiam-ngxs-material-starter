import { AuthenticatorSetup } from 'app/core/models/2fa/authenticator-setup.model.2fa';
import { AuthenticatorSetupResult } from 'app/core/models/2fa/authenticator-setup-result.model.2fa';
import { GenerateRecoveryCodesResultModel } from 'app/core/models/2fa/generate-recovery-codes-result-model.2fa';

/**
 * Holds QR code and shared key.
 */
export class AuthenticatorSetup {
	/**
	 * Type of action.
	 */
	static readonly type = '[2Fa] Authenticator Setup';

	/**
	 * Creates an instance of authenticator setup.
	 * @param paylaod
	 */
	constructor(public paylaod: AuthenticatorSetup) {}
}

/**
 * Result of verification process for setting up 2fa.
 */
export class AuthenticatorVerificationResult {
	/**
	 * Type of action.
	 */
	static readonly type = '[2Fa] Authenticator Verification Result';

	/**
	 * Creates an instance of authenticator verification result.
	 * @param payload
	 */
	constructor(public payload: AuthenticatorSetupResult) {}
}

/**
 * Generate recovery codes
 */
export class GenerateRecoveryCodes {
	/**
	 * Type action.
	 */
	static readonly type = '[2Fa] Generate Recovery Codes';

	/**
	 * Creates an instance of generate recovery codes.
	 * @param payload
	 */
	constructor(public payload: GenerateRecoveryCodesResultModel) {}
}

/**
 * Disables 2Fa authentication.
 */
export class Disable2Fa {
	/**
	 * Type action.
	 */
	static readonly type = '[2Fa] Disable 2Fa';

	/**
	 * Creates an instance of disable2 fa.
	 * @param payload
	 */
	constructor() {}
}
