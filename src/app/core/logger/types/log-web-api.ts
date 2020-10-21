import { LogPublisher } from '../log-publisher';
import { LogEntry } from '../log-entry';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

export class LogWebApi extends LogPublisher {
	constructor(private http: HttpClient) {
		super();
		this.location = '/api/log';
	}

	log(record: LogEntry): Observable<boolean> {
		const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
		const options = { headers: headers };
		return this.http.post<boolean>(this.location, record, options).pipe(catchError((err) => this.handleErrors(err)));
	}

	clear(): Observable<boolean> {
		// TODO: Call Web API to clear all values
		return of(true);
	}

	private handleErrors(error: any): Observable<any> {
		const errors: string[] = [];
		let msg = '';

		msg = 'Status: ' + error.status;
		msg += ' - Status Text: ' + error.statusText;
		if (error.json()) {
			msg += ' - Exception Message: ' + error.json().exceptionMessage;
		}
		errors.push(msg);

		console.error('An error occurred', errors);
		return Observable.throw(errors);
	}
}
