import { LogPublisher } from '../log-publisher';
import { LogEntry } from '../log-entry';
import { Observable, of } from 'rxjs';

export class LogLocalStorage extends LogPublisher {
	constructor() {
		super();
		this.location = 'logging';
	}

	log(record: LogEntry): Observable<boolean> {
		let ret = false;
		let values: LogEntry[];

		try {
			// Get previous values from local storage
			values = JSON.parse(localStorage.getItem(this.location)) || [];

			// Add new log entry to array
			values.push(record);

			// Store array into local storage
			localStorage.setItem(this.location, JSON.stringify(values));

			// set return value
			ret = true;
		} catch (ex) {
			console.error(ex);
		}

		return of(ret);
	}

	clear(): Observable<boolean> {
		localStorage.removeItem(this.location);
		return of(true);
	}
}
