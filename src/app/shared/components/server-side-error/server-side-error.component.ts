import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { LogService } from 'app/core/logger/log.service';
import { Observable, of } from 'rxjs';
import { upDownFadeInAnimation } from 'app/core/core.module';

/**
 * Server side error component that handles displaying server side errors.
 */
@Component({
	selector: 'odm-server-side-error',
	templateUrl: './server-side-error.component.html',
	styleUrls: ['./server-side-error.component.scss'],
	animations: [upDownFadeInAnimation],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServerSideErrorComponent implements OnInit {
	/**
	 * Server side error.
	 */
	@Input() serverError: ProblemDetails | InternalServerErrorDetails;

	/**
	 * Sets problem detials.
	 */
	@Input() set problemDetails(value: ProblemDetails) {
		this._log.debug('problemDetails emitted.', this);
		this._problemDetails = value;
	}

	_problemDetails: ProblemDetails;

	/**
	 * Sets internal server error details.
	 */
	@Input() set internalServerErrorDetails(value: InternalServerErrorDetails) {
		this._log.debug('internalServerErrorDetails emitted.', this);
		this._internalServerErrorDetails = value;
	}

	_internalServerErrorDetails: InternalServerErrorDetails;

	/**
	 * Error emitted CSS class. Used to show/hide server side errors.
	 */
	_errorEmitted: 'server-side-error__emitted' | 'none';

	/**
	 * Creates an instance of odm server side error component.
	 * @param _log
	 */
	constructor(private _log: LogService) {}

	/**
	 * NgOnInit life cycle.
	 */
	ngOnInit(): void {
		this._log.trace('Initialized', this);
	}

	/**
	 * Gets error message.
	 * @param serverError
	 * @returns error message
	 */
	_getErrorMessage$(): Observable<string> {
		if ((this.serverError as InternalServerErrorDetails)?.message) {
			return of((this.serverError as InternalServerErrorDetails).message);
		} else if (this.serverError) {
			return of(this.serverError.detail);
		}
	}
}
