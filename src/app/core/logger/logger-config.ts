import { LogPublishersConfig } from './log-publishers-config';

/**
 * Model for log-publishers.json file.
 */
export interface LoggerConfig {
	/**	Log level for the application */
	level: string;
	/** List of configured loggers */
	loggers: LogPublishersConfig[];
}
