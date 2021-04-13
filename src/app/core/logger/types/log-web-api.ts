import { LogPublisher } from '../log-publisher';
import { LogEntry } from '../log-entry';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

/**
 * Log class for logging messages to a rest api.
 */
export class LogWebApi extends LogPublisher {
	/**
	 * Creates an instance of LogWebApi and initializes location property.
	 * @param _http
	 */
	constructor(private _http: HttpClient) {
		super();
		this.location = '/api/log';
	}

	/**
	 * Logs given record to a rest api.
	 * @param record to log.
	 * @returns result of logging as an Observable<boolean>.
	 */
	log(record: LogEntry): Observable<boolean> {
		const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
		const options = { headers: headers };
		return this._http.post<boolean>(this.location, record, options).pipe(catchError((err) => this._handleErrors(err)));
	}

	/**
	 * Clears all logs from a rest api.
	 * @returns result of operation Observable<boolean>.
	 */
	clear(): Observable<boolean> {
		// TODO: Call Web API to clear all values.
		return of(true);
	}

	/**
	 * Handles errors returned by rest api.
	 * @param error HttpErrorResponse.
	 * @returns Observable<never>.
	 */
	private _handleErrors(error: HttpErrorResponse): Observable<never> {
		const errors: string[] = [];
		let msg = `Status: ${error.status} - Status Text: ${error.statusText}`;

		if (error) {
			msg += ' - Exception Message: ' + error.message;
		}

		errors.push(msg);
		console.error('An error occurred', errors);

		return Observable.throw(errors);
	}
}
