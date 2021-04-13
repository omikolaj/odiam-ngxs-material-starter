import { Injectable } from '@angular/core';
import { LogPublisher } from './log-publisher';
import { LogConsole } from './types/log-console';
import { LogLocalStorage } from './types/log-local-storage';
import { LogWebApi } from './types/log-web-api';
import { HttpClient } from '@angular/common/http';
import LoggersConfig from '../../../assets/log-publishers.json';
import { LogPublishersConfig } from './log-publishers-config';
import { LogLevel } from './log-level';
import { LoggerConfig } from './logger-config';

/**
 * Service responsible for building a list of active loggers.
 */
@Injectable({
	providedIn: 'root'
})
export class LogPublishersService {
	publishers: LogPublisher[] = [];
	level: LogLevel = LogLevel.Fatal;

	/**
	 * Initializes the publishers list from JSON file.
	 * @param _http
	 */
	constructor(private _http: HttpClient) {
		this._buildPublishers();
	}

	/**
	 * Builds a list of publishers.
	 */
	private _buildPublishers(): void {
		let logPub: LogPublisher;
		const loggerConfig = LoggersConfig as LoggerConfig;
		this.level = LogLevel[loggerConfig.level] as LogLevel;

		loggerConfig.loggers
			.filter((p) => p.isActive)
			.forEach((pub: LogPublishersConfig) => {
				switch (pub.loggerName.toLowerCase()) {
					case 'console':
						logPub = new LogConsole();
						break;
					case 'localstorage':
						logPub = new LogLocalStorage();
						break;
					case 'webapi':
						logPub = new LogWebApi(this._http);
						break;
				}

				// Set location of logging.
				logPub.location = pub.loggerLocation;

				// Add publisher to array.
				this.publishers.push(logPub);
			});
	}
}
