import { Injectable } from '@angular/core';
import { LogEntry } from './log-entry';
import { LogPublisher } from './log-publisher';
import { LogPublishersService } from './log-publishers.service';
import { LogLevel } from './log-level';
import { ComponentType } from '@angular/cdk/portal';

/**
 * Logging service that performs the logging.
 */
@Injectable({
	providedIn: 'root'
})
export class LogService {
	/**
	 * Level of logging enabled for this log service.
	 */
	level: LogLevel;

	/**
	 * Determines if logs should include date and time.
	 */
	logWithDate = true;

	/**
	 * List of log publishers.
	 */
	publishers: LogPublisher[] = [];

	/**
	 * Initializes list of active publishers.
	 * @param publishersService
	 */
	constructor(publishersService: LogPublishersService) {
		this.publishers = publishersService.publishers;
		this.level = publishersService.level;
	}

	/**
	 * Looks for name of the passed in object.
	 * @template T
	 * @param from
	 * @returns fromLog
	 */
	private _from<T>(from: string | unknown | ComponentType<T>): string {
		let fromLog = '';
		if (typeof from === 'string') {
			fromLog = from;
		} else if (this._isTypeError(from)) {
			fromLog = from.name;
		} else if (this._isComponent(from)) {
			fromLog = from.name;
		} else if (from) {
			fromLog = from.constructor.name;
		}

		return fromLog;
	}

	/**
	 * Determines whether passed in object is an Angular component class.
	 * @template T
	 * @param from
	 * @returns rather from is an Angular component.
	 */
	private _isComponent<T>(from: string | ComponentType<T> | unknown): from is ComponentType<T> {
		return ((from as ComponentType<T>) || {})?.name !== undefined;
	}

	/**
	 * Determines whether error is of type TypeError.
	 * @template T
	 * @param from
	 * @returns type error
	 */
	private _isTypeError<T>(from: string | ComponentType<T> | unknown): from is TypeError {
		return ((from as TypeError) || {}).name !== undefined && ((from as TypeError) || {}).message !== undefined;
	}

	/**
	 * Adds from string to the log.
	 * @template T
	 * @param msg log to be logged.
	 * @param from where the log is coming from.
	 * @returns formatted log with from parameter if applicable.
	 */
	private _addFrom<T>(msg: string, from: string | unknown | ComponentType<T>): string {
		const fromLog = this._from<T>(from);
		if (fromLog !== '') {
			const log = `[${fromLog}] ${msg}`;
			return log;
		}
		return msg;
	}

	/**
	 * Creates logs for LogLevel.Debug = 1.
	 * @param msg
	 * @param optionalParams
	 */
	debug<T>(msg: string, from?: string | unknown | ComponentType<T>, ...optionalParams: any[]): void {
		this._writeToLog<T>(msg, from, LogLevel.Debug, optionalParams);
	}

	/**
	 * Creates logs for LogLevel.Info = 2.
	 * @param msg
	 * @param optionalParams
	 */
	info<T>(msg: string, from?: string | unknown | ComponentType<T>, ...optionalParams: any[]): void {
		this._writeToLog<T>(msg, from, LogLevel.Info, optionalParams);
	}

	/**
	 * Creates logs for LogLevel.Warn = 3.
	 * @param msg
	 * @param optionalParams
	 */
	warn<T>(msg: string, from?: string | unknown | ComponentType<T>, ...optionalParams: any[]): void {
		this._writeToLog<T>(msg, from, LogLevel.Warn, optionalParams);
	}

	/**
	 * Creates logs for LogLevel.Error = 4.
	 * @param msg
	 * @param optionalParams
	 */
	error<T>(msg: string, from?: string | unknown | ComponentType<T>, ...optionalParams: any[]): void {
		this._writeToLog<T>(msg, from, LogLevel.Error, optionalParams);
	}

	/**
	 * Creates logs for LogLevel.Fatal = 5.
	 * @param msg
	 * @param optionalParams
	 */
	fatal<T>(msg: string, from?: string | unknown | ComponentType<T>, ...optionalParams: any[]): void {
		this._writeToLog<T>(msg, from, LogLevel.Fatal, optionalParams);
	}

	/**
	 * Creates logs for LogLevel.Trace = 6.
	 * @param msg
	 * @param optionalParams
	 */
	trace<T>(msg: string, from?: string | unknown | ComponentType<T>, ...optionalParams: any[]): void {
		this._writeToLog<T>(msg, from, LogLevel.Trace, optionalParams);
	}

	/**
	 * Writes logs to all active publishers.
	 * @param msg
	 * @param level
	 * @param params
	 */
	private _writeToLog<T>(msg: string, from: string | unknown | ComponentType<T>, level: LogLevel, params: any[]): void {
		if (this.shouldLog(level)) {
			const entry: LogEntry = new LogEntry();
			msg = this._addFrom<T>(msg, from);
			entry.message = msg;
			entry.level = level;
			entry.extraInfo = params;
			entry.logWithDate = this.logWithDate;

			this.publishers.forEach((logger: LogPublisher) => {
				logger.log(entry).subscribe();
			});
		}
	}

	/**
	 * Determines if logging will occur.
	 * @param level
	 * @returns whether logs will be published.
	 */
	private shouldLog(level: LogLevel): boolean {
		let ret = false;
		if ((level >= this.level && level !== LogLevel.Off) || this.level === LogLevel.Trace) {
			ret = true;
		}
		return ret;
	}
}
