import { LogLevel } from './log-level';

export class LogEntry {
  entryDate: Date = new Date();
  message: string = '';
  level: LogLevel = LogLevel.Debug;
  extraInfo: any[] = [];
  logWithDate: boolean = true;

  buildLogString(): string {
    let ret: string = '';

    if (this.logWithDate) {
      const date = new Date();

      ret =
        `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date
          .getFullYear()
          .toString()
          .padStart(4, '0')} ${date.getHours().toString().padStart(2, '0')}:${date
          .getMinutes()
          .toString()
          .padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}` + ' ';
    }

    ret += '[Level]: ' + LogLevel[this.level];
    ret += ' | [Log]: ' + this.message;
    if (this.extraInfo.length) {
      ret += ' - [Extra Info]: ' + this.formatParams(this.extraInfo);
    }

    return ret;
  }

  private formatParams(params: any[]): string {
    let ret: string = params.join(',');

    // Is there at least one object in the array?
    if (params.some((p) => typeof p == 'object')) {
      ret = '';

      // Build comma-delimited string
      for (let item of params) {
        ret += JSON.stringify(item) + ', ';
      }
    }

    return ret;
  }
}
