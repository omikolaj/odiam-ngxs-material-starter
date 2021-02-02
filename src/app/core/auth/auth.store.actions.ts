import { AccessTokenModel } from './access-token.model';
import { ActivePanel } from './active-panel.model';

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
	constructor(public payload: boolean) {}
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
	constructor(public payload: { AccessTokenModel: AccessTokenModel; rememberMe: boolean; userId: string }) {}
}

/**
 * Set current user id
 */
export class SetCurrentUserId {
	/**
	 * Type of action.
	 */
	static readonly type = '[Auth] Set Current User Id';

	/**
	 * Creates an instance of set current user id.
	 * @param payload
	 */
	constructor(public payload: string) {}
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
	constructor(public payload: { activeAuthType: ActivePanel }) {}
}
