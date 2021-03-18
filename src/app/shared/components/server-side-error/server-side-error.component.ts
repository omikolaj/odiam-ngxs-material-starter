import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { LogService } from 'app/core/logger/log.service';
import { Observable, of } from 'rxjs';
import { upDownFadeInAnimation } from 'app/core/core.module';

/**
 * Component that handles displaying server side errors.
 */
@Component({
	selector: 'odm-server-side-error',
	templateUrl: './server-side-error.component.html',
	styleUrls: ['./server-side-error.component.scss'],
	animations: [upDownFadeInAnimation],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServerSideErrorComponent {
	/**
	 * Emits when server responds with 40X or 50X error.
	 */
	@Input() set serverError(value: ProblemDetails | InternalServerErrorDetails) {
		this.log.debug('serverError emitted., With value:', this, value);
		this._serverError = value;
	}

	_serverError: ProblemDetails | InternalServerErrorDetails;

	/**
	 * Creates an instance of odm server side error component.
	 * @param log
	 */
	constructor(private log: LogService) {}

	/**
	 * Gets error message.
	 * @returns error message
	 */
	_getErrorMessage$(): Observable<string> {
		if ((this._serverError as InternalServerErrorDetails).message) {
			return of((this._serverError as InternalServerErrorDetails).message);
		} else {
			return of(this._serverError.detail);
		}
	}
}
