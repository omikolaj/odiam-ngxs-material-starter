import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { LogService } from 'app/core/logger/log.service';
import { Observable, of, merge } from 'rxjs';
import { upDownFadeInAnimation } from 'app/core/core.module';
import { ProblemDetailsError } from 'app/core/error-handler/problem-details-error.decorator';
import { InternalServerError } from 'app/core/error-handler/internal-server-error.decorator';
import { tap } from 'rxjs/internal/operators/tap';

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
	 * Emitted when server responds with 40X error.
	 */
	@ProblemDetailsError() problemDetails$: Observable<ProblemDetails>;

	/**
	 * Emitted when server responds with 50X error.
	 */
	@InternalServerError() internalServerError$: Observable<InternalServerErrorDetails>;

	/**
	 * Whether to show the error or not.
	 */
	@Input() showError = true;

	/**
	 * Server side error.
	 */
	_serverError$: Observable<ProblemDetails | InternalServerErrorDetails>;

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
		this._serverError$ = merge(
			this.problemDetails$.pipe(tap((err) => this.log.trace('Problem details:', this, err))),
			this.internalServerError$.pipe(tap((err) => this.log.trace('Internal Server error:', this, err)))
		);
	}

	/**
	 * Gets error message.
	 * @param serverError
	 * @returns error message
	 */
	_getErrorMessage$(serverError: ProblemDetails | InternalServerErrorDetails): Observable<string> {
		if ((serverError as InternalServerErrorDetails).message) {
			return of((serverError as InternalServerErrorDetails).message);
		} else {
			return of(serverError.detail);
		}
	}
}
