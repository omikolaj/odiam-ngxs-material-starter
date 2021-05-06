import { LogLevel } from './log-level';

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
	buildLogString(): string {
		let ret = '';

		if (this._logWithDate) {
			const date = new Date();

			const dateFormated = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date
				.getDate()
				.toString()
				.padStart(2, '0')}/${date.getFullYear().toString().padStart(4, '0')} ${date
				.getHours()
				.toString()
				.padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;

			ret += `[${LogLevel[this.level].toUpperCase()}] ${dateFormated}: `;
		} else {
			ret += `[${LogLevel[this.level].toUpperCase()}]: `;
		}
		ret += this.message;
		if (this.extraInfo.length) {
			ret += ' [Data]: ' + this._formatParams(this.extraInfo);
		}

		return ret;
	}

	/**
	 * Formats extra info parameters.
	 * @param params list of additional items to be logged.
	 * @returns string.
	 */
	private _formatParams(params: any[]): string {
		let ret: string = params.join(',');

		// Is there at least one object in the array?
		if (params.some((p) => typeof p === 'object')) {
			ret = '';

			// Build comma-delimited string
			for (let index = 0; index < params.length; index++) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				const item = params[index];
				ret += JSON.stringify(item) + ',';
			}
		}
		return ret;
	}
}
