import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
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
export class ServerSideErrorComponent implements OnInit {
	/**
	 * Whether to show the error or not.
	 */
	@Input() showError = true;

	/**
	 * Server side error.
	 */
	@Input() serverError: ProblemDetails | InternalServerErrorDetails;

	@Input() set problemDetails(value: ProblemDetails) {
		console.log('problem details error emitted: ', value);
		this._problemDetails = value;
	}

	_problemDetails: ProblemDetails;

	@Input() set internalServerErrorDetails(value: InternalServerErrorDetails) {
		console.log('internal server error emitted: ', value);
		this._internalServerErrorDetails = value;
	}

	_internalServerErrorDetails: InternalServerErrorDetails;

	/**
	 * Creates an instance of odm server side error component.
	 * @param log
	 */
	constructor(private log: LogService) {}

	/**
	 * NgOnInit life cycle.
	 */
	ngOnInit(): void {
		this.log.trace('Initialized', this);
		// this._serverError$ = merge(
		// 	this.problemDetails$.pipe(tap((err) => this.log.trace('Problem details:', this, err))),
		// 	this.internalServerError$.pipe(tap((err) => this.log.trace('Internal Server error:', this, err)))
		// );
	}

	/**
	 * Gets error message.
	 * @param serverError
	 * @returns error message
	 */
	_getErrorMessage$(): Observable<string> {
		if ((this.serverError as InternalServerErrorDetails).message) {
			return of((this.serverError as InternalServerErrorDetails).message);
		} else {
			return of(this.serverError.detail);
		}
	}
}
