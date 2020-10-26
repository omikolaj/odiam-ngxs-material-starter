import { LogPublisher } from '../log-publisher';
import { LogEntry } from '../log-entry';
import { Observable, of } from 'rxjs';
import { LogLevel } from '../log-level';

/**
 * Log class for logging messages to the console.
 */
export class LogConsole extends LogPublisher {
	/**
	 * Logs given record to the console.
	 * @param record to log.
	 * @returns result of logging as an Observable<boolean>.
	 */
	log(record: LogEntry): Observable<boolean> {
		const log = record.buildLogString();
		switch (record.level) {
			case LogLevel.Trace:
			default:
				console.log(log);
				break;
			case LogLevel.Info:
			case LogLevel.Debug:
				console.info(log);
				break;
			case LogLevel.Warn:
				console.warn(log);
				break;
			case LogLevel.Error:
			case LogLevel.Fatal:
				console.error(log);
				break;
		}
		return of(true);
	}

	/**
	 * Clears all logs from the console.
	 * @returns result of operation Observable<boolean>, which is always true.
	 */
	clear(): Observable<boolean> {
		console.clear();
		return of(true);
	}
}
