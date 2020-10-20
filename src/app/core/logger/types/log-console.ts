import { LogPublisher } from '../log-publisher';
import { LogEntry } from '../log-entry';
import { Observable, of } from 'rxjs';
import { LogLevel } from '../log-level';

export class LogConsole extends LogPublisher {
  log(record: LogEntry): Observable<boolean> {
    const log = record.buildLogString();
    switch (record.level) {
      case LogLevel.All:
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

  clear(): Observable<boolean> {
    console.clear();
    return of(true);
  }
}
