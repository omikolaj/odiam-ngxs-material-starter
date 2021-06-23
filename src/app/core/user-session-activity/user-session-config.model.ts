/**
 * User session configuration
 */
export interface UserSessionConfig {
	/**
	 * After how long of idle time (in seconds) should user's session be considered expired.
	 */
	sessionIdleTimeout: number;

	/**
	 * How frequently (in seconds) to check if user's session is idle.
	 */
	checkIfSessionIdleInterval: number;

	/**
	 * After how much idle time (in seconds) should auth dialog be closed and user signed out.
	 * Note: This dialog is displayed when user is inactive and their session is about to expire. User is then prompted to stay signed in or sign out. If no action is taken dialog is closed and user is signed out
	 */
	sessionExpiredDialogTimeout: number;
}
