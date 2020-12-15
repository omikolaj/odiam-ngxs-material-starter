import { AccessToken } from './access-token.model';

/**
 * Init auth state from local storage.
 */
export class InitStateFromLocalStorage {
	/**
	 * Type of action.
	 */
	static readonly type = '[Settings] Init Settings from Local Storage';
	constructor() {}
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
	constructor(public payload: AccessToken) {}
}

/**
 * Signs user out.
 */
export class Signout {
	/**
	 * Type of action.
	 */
	static readonly type = '[Auth] Signout';
	constructor() {}
}
