import { Observable, of } from 'rxjs';
import { LogEntry } from '../log-entry';
import { LogLevel } from '../log-level';
import { LogPublisher } from '../log-publisher';
import { LogData } from '../log.type';

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
				this._logInfo(log);
				break;
			case LogLevel.Info:
			case LogLevel.Debug:
				this._logInfo(log);
				break;
			case LogLevel.Warn:
				this._logWarn(log);
				break;
			case LogLevel.Error:
			case LogLevel.Fatal:
				this._logError(log);
				break;
		}
		return of(true);
	}

	/**
	 * @description Logs info.
	 * @param log
	 */
	private _logInfo(log: LogData): void {
		if (log.data) {
			console.log(log.message, log.data);
		} else {
			console.log(log.message);
		}
	}

	/**
	 * @description Logs warn.
	 * @param log
	 */
	private _logWarn(log: LogData): void {
		if (log.data) {
			console.warn(log.message, log.data);
		} else {
			console.log(log.message);
		}
	}

	/**
	 * @description Logs error.
	 * @param log
	 */
	private _logError(log: LogData): void {
		if (log.data) {
			console.warn(log.message, log.data);
		} else {
			console.log(log.message);
		}
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
