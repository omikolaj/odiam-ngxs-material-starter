import { ActivePanel } from './active-panel.model';

/**
 * Key used as a key for user auth object when persisting to local storage.
 */
export const AUTH_KEY = 'AUTH';

/**
 * Auth state model.
 */
export interface AuthStateModel {
	/**
	 * Determines if user is authenticated.
	 */
	isAuthenticated: boolean;

	/**
	 * Currently logged in user id.
	 */
	userId: string;

	/**
	 *  Determines if remember me option is selected.
	 */
	rememberMe: boolean;

	/**
	 * Encode json web token.
	 */
	access_token: string;

	/**
	 * Time when the access token will expire.
	 */
	expires_at: number;

	/**
	 * Whether sign-in or sign-up component should be displayed.
	 */
	activeAuthType: ActivePanel;
}
