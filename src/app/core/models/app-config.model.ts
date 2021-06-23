import { UserSessionConfig } from '../user-session-activity/user-session-config.model';

/**
 * Configuration for the application
 */
export interface AppConfig {
	/**
	 * Refers to app configration for user's session.
	 */
	session: UserSessionConfig;
}
