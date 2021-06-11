import { AccessToken } from '../models/auth/access-token.model';
import { ActiveAuthType } from '../models/auth/active-auth-type.model';
import { AuthStateModel } from './auth-state-model';

/**
 * Init auth state from local storage.
 */
export class InitStateFromLocalStorage {
	/**
	 * Type of action.
	 */
	static readonly type = '[Settings] Init Settings from Local Storage';
}

/**
 * Updates remember me option.
 */
export class RememberMeOptionChange {
	/**
	 * Type of action.
	 */
	static readonly type = '[Auth] Remember me';
	/**
	 * Creates an instance of remember me option change action.
	 * @param payload
	 */
	constructor(public payload: { rememberMe: boolean }) {}
}

/**
 * Persists user's username in local storage.
 */
export class UpdateRememberMeUsername {
	/**
	 * Type of action.
	 */
	static readonly type = '[Auth] Update Remember My Email Username';
	/**
	 * Creates an instance of remember username action.
	 * @param payload
	 */
	constructor(public payload: { username: string }) {}
}

/**
 * Keep or remove remember me username. Based on 'Remember my email' option.
 */
export class KeepOrRemoveRememberMeUsername {
	/**
	 * Type of action.
	 */
	static readonly type = '[Auth] Keep or Remove Remember My Email Username';
}

/**
 * Updates state with default values for properties not stored in local storage.
 */
export class SetDefaults {
	/**
	 * Type of action.
	 */
	static readonly type = '[Auth] Set Defaults';
}

/**
 * Signs user in.
 */
export class Signin {
	/**
	 * Type of action.
	 */
	static readonly type = '[Auth] Signin';
	/**
	 * Creates an instance of signin action.
	 * @param payload
	 */
	constructor(public payload: { accessToken: AccessToken; userId: string }) {}
}

/**
 * Was two step verification code successfully verified by the server.
 */
export class Is2StepVerificationSuccessful {
	/**
	 * Type of action.
	 */
	static readonly type = '[Auth] Is2StepVerificationSuccessful';
	/**
	 * Creates an instance of Is2StepVerificationSuccessful action.
	 * @param payload
	 */
	constructor(public payload: { is2StepVerificationSuccessful: boolean }) {}
}

/**
 * Is two step verification protocol required to sign user in.
 */
export class Is2StepVerificationRequired {
	/**
	 * Type of action.
	 */
	static readonly type = '[Auth] Is2StepVerificationRequired';
	/**
	 * Creates an instance of Is2StepVerificationRequired action.
	 * @param payload
	 */
	constructor(public payload: { is2StepVerificationRequired: boolean }) {}
}

/**
 * Was recovery code redemption successful.
 */
export class IsRedeemRecoveryCodeSuccessful {
	/**
	 * Type of action.
	 */
	static readonly type = '[Auth] IsRedeemRecoveryCodeSuccessful';
	/**
	 * Creates an instance of IsRedeemRecoveryCodeSuccessful action.
	 * @param payload
	 */
	constructor(public payload: { isRedeemRecoveryCodeSuccessful: boolean }) {}
}

/**
 * Signs user out.
 */
export class Signout {
	/**
	 * Type of action.
	 */
	static readonly type = '[Auth] Signout';
}

/**
 * Toggles between sign-in and sign-up auth types.
 */
export class SwitchAuthType {
	/**
	 * Type of action.
	 */
	static readonly type = '[Auth] Switch Auth Type';

	/**
	 * Creates an instance of switch auth type.
	 * @param payload
	 */
	constructor(public payload: { activeAuthType: ActiveAuthType }) {}
}

/**
 * Whether user's password reset request completed without errors.
 */
export class PasswordResetCompleted {
	/**
	 * Type of action.
	 */
	static readonly type = '[Auth] Password Reset Completed';

	/**
	 * Creates an instance of password reset completed.
	 * @param payload
	 */
	constructor(public payload: { passwordResetCompleted: boolean }) {}
}

/**
 * Whether user's registration request completed without errors.
 */
export class RegistrationCompleted {
	/**
	 * Type of action.
	 */
	static readonly type = '[Auth] Registration Completed';

	/**
	 * Creates an instance of registration completed.
	 * @param payload
	 */
	constructor(public payload: { registrationCompleted: boolean }) {}
}

/**
 * Persist settings action.
 */
export class PersistSettings {
	/**
	 * Type of action.
	 */
	static readonly type = '[Auth] Persist Settings';

	/**
	 * Creates an instance of persist settings action.
	 * @param payload
	 */
	constructor(public payload: AuthStateModel) {}
}

export class ChangeEmailConfirmationInProgress {
	/**
	 * Type of action.
	 */
	static readonly type = '[Auth] Change Email Confirmation In Progress';

	/**
	 * Creates an instance of email change completed.
	 * @param payload
	 */
	constructor(public payload: { changeEmailConfirmationInProgress: boolean }) {}
}

export class EmailConfirmationInProgress {
	/**
	 * Type of action.
	 */
	static readonly type = '[Auth] Email Confirmation In Progress';

	/**
	 * Creates an instance of email change completed.
	 * @param payload
	 */
	constructor(public payload: { emailConfirmationInProgress: boolean }) {}
}
