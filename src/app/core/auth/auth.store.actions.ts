import { AccessToken } from './access-token.model';
import { ActiveAuthType } from './active-auth-type.model';

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
 * Update remember username. Updates username value in localstorage.
 */
export class UpdateRememberUsername {
	/**
	 * Type of action.
	 */
	static readonly type = '[Auth] Update Remember Username';
	/**
	 * Creates an instance of remember username action.
	 * @param payload
	 */
	constructor(public payload: string) {}
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
