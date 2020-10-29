import { Injectable, ErrorHandler } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { environment } from '../../../environments/environment';

import { NotificationService } from '../notifications/notification.service';
import { LogService } from '../logger/log.service';

/** Application-wide error handler that adds a UI notification to the error handling
 * provided by the default Angular ErrorHandler.
 */
@Injectable()
export class AppErrorHandler extends ErrorHandler {
	/**
	 * Creates an instance of global error handler.
	 * @param notificationsService
	 * @param log
	 */
	constructor(private notificationsService: NotificationService, private log: LogService) {
		super();
	}

	/**
	 * Global error handling for HttpErrorResponse.
	 * @param error
	 */
	handleError(error: Error | HttpErrorResponse): void {
		this.log.error('An error occured.', this, error);
		let displayMessage = 'An error occurred.';

		if (!environment.production) {
			displayMessage += ' See console for details.';
		}

		this.notificationsService.error(displayMessage);

		super.handleError(error);
	}
}
