import { AccessToken } from './models/access-token.model';
import { ActiveAuthType } from './models/active-auth-type.model';

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
	constructor(public payload: string) {}
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
 * Updates stay signed in option.
 */
export class StaySignedinOptionChange {
	/**
	 * Type of action.
	 */
	static readonly type = '[Auth] Stay Signed in';
	/**
	 * Creates an instance of stay signed in option change action.
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
	constructor(public payload: { accessToken: AccessToken; userId: string }) {}
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
	constructor(public payload: { activeAuthType: ActiveAuthType }) {}
}
