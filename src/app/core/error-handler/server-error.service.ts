import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { InternalServerErrorDetails } from '../models/internal-server-error-details.model';
import { ProblemDetails } from '../models/problem-details.model';

/**
 * Server error service.
 */
@Injectable({
	providedIn: 'root'
})
export class ServerErrorService {
	/**
	 * Problem details subject for emiting problem details error.
	 */
	private problemDetailsSub$ = new Subject<ProblemDetails>();
	/**
	 * Internal server error subject for emtting insternal server error.
	 */
	private internalServerErrorSub$ = new Subject<InternalServerErrorDetails>();

	/**
	 * Gets problem details error observable.
	 */
	getProblemDetails$: Observable<ProblemDetails> = this.problemDetailsSub$.asObservable();

	/**
	 * Get internal server error observable.
	 */
	getInternalServerError$: Observable<InternalServerErrorDetails> = this.internalServerErrorSub$.asObservable();

	/**
	 * Sets problem details error object.
	 */
	set problemDetails(error: ProblemDetails) {
		this.problemDetailsSub$.next(error);
	}

	/**
	 * Sets internal server error.
	 */
	set internalServerErrorDetails(error: InternalServerErrorDetails) {
		this.internalServerErrorSub$.next(error);
	}
}
