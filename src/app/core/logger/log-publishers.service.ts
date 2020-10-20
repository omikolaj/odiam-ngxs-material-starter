import { Injectable } from '@angular/core';
import { LogPublisher } from './log-publisher';
import { LogConsole } from './types/log-console';
import { LogLocalStorage } from './types/log-local-storage';
import { LogWebApi } from './types/log-web-api';
import { HttpClient } from '@angular/common/http';
import LoggersConfig from '../../../assets/log-publishers.json';

@Injectable({
  providedIn: 'root'
})
export class LogPublishersService {
  publishers: LogPublisher[] = [];

  constructor(private http: HttpClient) {
    this.buildPublishers();
  }

  private buildPublishers(): void {
    let logPub: LogPublisher;
    for (let pub of LoggersConfig.filter((p) => p.isActive)) {
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
  }
}
