/**
 * Authentication configuration from app.config.json file.
 */
export interface AuthConfig {
	/**
	 * Timeout until auth dialog will be closed and user will be signed out if user takes no action.
	 */
	sessionExpiredDialogTimeout: number;
}
