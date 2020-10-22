import { Injectable } from '@angular/core';
import { LogEntry } from './log-entry';
import { LogPublisher } from './log-publisher';
import { LogPublishersService } from './log-publishers.service';
import { LogLevel } from './log-level';

/**
 * Logging service that performs the logging
 */
@Injectable()
export class LogService {
	/**
	 * Level of logging enabled for this log service
	 */
	level: LogLevel = LogLevel.Trace;

	/**
	 * Determines if logs should include date and time
	 */
	logWithDate = true;

	/**
	 * List of log publishers
	 */
	publishers: LogPublisher[] = [];

	/**
	 * Initializes list of active publishers
	 * @param publishersService
	 */
	constructor(publishersService: LogPublishersService) {
		this.publishers = publishersService.publishers;
	}

	/**
	 * Creates logs for LogLevel.Debug = 1
	 * @param msg
	 * @param optionalParams
	 */
	debug(msg: string, ...optionalParams: any[]): void {
		this.writeToLog(msg, LogLevel.Debug, optionalParams);
	}

	/**
	 * Creates logs for LogLevel.Info = 2
	 * @param msg
	 * @param optionalParams
	 */
	info(msg: string, ...optionalParams: any[]): void {
		this.writeToLog(msg, LogLevel.Info, optionalParams);
	}

	/**
	 * Creates logs for LogLevel.Warn = 3
	 * @param msg
	 * @param optionalParams
	 */
	warn(msg: string, ...optionalParams: any[]): void {
		this.writeToLog(msg, LogLevel.Warn, optionalParams);
	}

	/**
	 * Creates logs for LogLevel.Error = 4
	 * @param msg
	 * @param optionalParams
	 */
	error(msg: string, ...optionalParams: any[]): void {
		this.writeToLog(msg, LogLevel.Error, optionalParams);
	}

	/**
	 * Creates logs for LogLevel.Fatal = 5
	 * @param msg
	 * @param optionalParams
	 */
	fatal(msg: string, ...optionalParams: any[]): void {
		this.writeToLog(msg, LogLevel.Fatal, optionalParams);
	}

	/**
	 * Creates logs for LogLevel.Trace = 6
	 * @param msg
	 * @param optionalParams
	 */
	log(msg: string, ...optionalParams: any[]): void {
		this.writeToLog(msg, LogLevel.Trace, optionalParams);
	}

	/**
	 * Writes logs to all active publishers
	 * @param msg
	 * @param level
	 * @param params
	 */
	private writeToLog(msg: string, level: LogLevel, params: any[]): void {
		if (this.shouldLog(level)) {
			const entry: LogEntry = new LogEntry();
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
	 * Determines if logging will occur
	 * @param level
	 * @returns whether logs will be published
	 */
	private shouldLog(level: LogLevel): boolean {
		let ret = false;
		if ((level >= this.level && level !== LogLevel.Off) || this.level === LogLevel.Trace) {
			ret = true;
		}
		return ret;
	}
}
