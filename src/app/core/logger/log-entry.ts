import { LogLevel } from './log-level';
import { LogData } from './log.type';

/**
 * Log entry class responsible for building string that will be logged.
 */
export class LogEntry {
	/**
	 * Log entry date.
	 */
	entryDate: Date = new Date();

	/**
	 * Message that should be logged.
	 */
	message = '';

	/**
	 * Level of this log message. Defaults to LogLevel.Trace.
	 */
	level: LogLevel = LogLevel.Trace;

	/**
	 * Extra objects to be included with the log.
	 */
	extraInfo: any[] = [];

	/**
	 * Whether date should be inlcuded in the log.
	 */
	private readonly _logWithDate: boolean;

	/**
	 * Creates an instance of log entry.
	 * @param logWithDate
	 */
	constructor(logWithDate: boolean) {
		this._logWithDate = logWithDate;
	}

	/**
	 * Builds log string.
	 * @returns log string.
	 */
	buildLogString(): LogData {
		const ret: LogData = { message: '' };

		if (this._logWithDate) {
			const date = new Date();

			const dateFormated = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date
				.getFullYear()
				.toString()
				.padStart(4, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date
				.getSeconds()
				.toString()
				.padStart(2, '0')}`;

			ret.message = `[${LogLevel[this.level].toUpperCase()}] ${dateFormated}:`;
		} else {
			ret.message = `[${LogLevel[this.level].toUpperCase()}]: `;
		}
		ret.message += this.message;
		if (this.extraInfo.length) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			ret.data = this._formatParams();
		}

		return ret;
	}

	/**
	 * Formats extra info parameters.
	 * @param params list of additional items to be logged.
	 * @returns string.
	 */
	private _formatParams(): any {
		const objRet = {};
		let stringRet = '';
		this.extraInfo.forEach((item) => {
			if (item) {
				if (typeof item === 'object') {
					// eslint-disable-next-line no-restricted-syntax
					Object.keys(item).forEach((key) => {
						// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
						objRet[key] = item[key];
					});
				} else {
					stringRet += item;
				}
			}
		});

		if (stringRet) {
			return stringRet;
		} else {
			return objRet;
		}
	}
}
