/**
 * Log publishers config model
 */
export class LogPublishersConfig {
	/** Name of the logger */
	loggerName: string;

	/** Type location of the logger. Console, localStorage or api */
	loggerLocation: string;

	/** Whether given logger is active */
	isActive: boolean;
}
