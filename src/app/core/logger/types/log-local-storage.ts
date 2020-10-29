import { LogPublisher } from '../log-publisher';
import { LogEntry } from '../log-entry';
import { Observable, of } from 'rxjs';

/**
 * Log class for logging messages to the localStorage.
 */
export class LogLocalStorage extends LogPublisher {
	/**
	 * Creates an instance of LogLocalStorage and initializes location property.
	 */
	constructor() {
		super();
		this.location = 'logging';
	}

	/**
	 * Logs given record to localStorage.
	 * @param record to log.
	 * @returns result of logging as an Observable<boolean>.
	 */
	log(record: LogEntry): Observable<boolean> {
		let ret = false;
		let values: LogEntry[];

		try {
			// Get previous values from local storage.
			values = (JSON.parse(localStorage.getItem(this.location)) as LogEntry[]) || [];

			// Add new log entry to array.
			values.push(record);

			// Store array into local storage.
			localStorage.setItem(this.location, JSON.stringify(values));

			// set return value.
			ret = true;
		} catch (ex) {
			console.error(ex);
		}

		return of(ret);
	}

	/**
	 * Clears all logs from localStorage.
	 * @returns result of operation Observable<boolean>, which is always true.
	 */
	clear(): Observable<boolean> {
		localStorage.removeItem(this.location);
		return of(true);
	}
}
