/**
 * Key used as a key for user auth object when persisting to local storage
 */
export const AUTH_KEY = 'AUTH';

/**
 * Auth state model
 */
export interface AuthStateModel {
	/**
	 * Determines if user is authenticated
	 */
	isAuthenticated: boolean;
}
