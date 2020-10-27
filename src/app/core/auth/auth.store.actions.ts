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
 * Log user in.
 */
export class Login {
	/**
	 * Type of action.
	 */
	static readonly type = '[Auth] Login';
	constructor() {}
}

/**
 * Log user out.
 */
export class Logout {
	/**
	 * Type of action.
	 */
	static readonly type = '[Auth] Logout';
	constructor() {}
}
