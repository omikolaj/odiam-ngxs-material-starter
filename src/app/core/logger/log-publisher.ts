import { LogEntry } from './log-entry';
import { Observable } from 'rxjs';

/**
 * Log publisher abstract class
 */
export abstract class LogPublisher {
	/** Location of a given logger */
	location: string;

	/**
	 * Handles logging logic
	 * @param record
	 * @returns result of logging operation
	 */
	abstract log(record: LogEntry): Observable<boolean>;

	/**
	 * Handles clearing of logs logic
	 * @returns result of clearing operation
	 */
	abstract clear(): Observable<boolean>;
}
