import { Injectable } from '@angular/core';
import { LogPublisher } from './log-publisher';
import { LogConsole } from './types/log-console';
import { LogLocalStorage } from './types/log-local-storage';
import { LogWebApi } from './types/log-web-api';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LogPublishersConfig } from './log-publishers-config';
import { catchError } from 'rxjs/operators';

const PUBLISHERS_FILE = '../../../assets/log-publishers.json';

@Injectable({
  providedIn: 'root'
})
export class LogPublishersService {
  publishers: LogPublisher[] = [];

  constructor(private http: HttpClient) {
    this.buildPublishers();
  }

  buildPublishers(): void {
    let logPub: LogPublisher;

    this.getLoggers().subscribe((response) => {
      for (let pub of response.filter((p) => p.isActive)) {
        switch (pub.loggerName.toLowerCase()) {
          case 'console':
            logPub = new LogConsole();
            break;
          case 'localstorage':
            logPub = new LogLocalStorage();
            break;
          case 'webapi':
            logPub = new LogWebApi(this.http);
            break;
        }

        // Set location of logging
        logPub.location = pub.loggerLocation;

        // Add publisher to array
        this.publishers.push(logPub);
      }
    });
  }

  getLoggers(): Observable<LogPublishersConfig[]> {
    return this.http.get<LogPublishersConfig[]>(PUBLISHERS_FILE).pipe(catchError((err) => this.handleErrors(err)));
  }

  private handleErrors(error: any): Observable<any> {
    let errors: string[] = [];
    let msg: string = '';

    msg = 'Status: ' + error.status;
    msg += ' - Status Text: ' + error.statusText;
    if (error) {
      msg += ' - Exception Message: ' + error.exceptionMessage;
    }
    errors.push(msg);
    console.error('An error occurred', errors);
    return Observable.throw(errors);
  }
}
