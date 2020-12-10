import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { ProblemDetails } from '../models/problem-details.model';

/**
 *
 */
@Injectable({
	providedIn: 'root'
})
export class ProblemDetailsService {
	private problemDetailsSub$ = new Subject<ProblemDetails>();

	getProblemDetails$: Observable<ProblemDetails> = this.problemDetailsSub$.asObservable();

	/**
	 * Sets problem details error object.
	 */
	set problemDetails(errors: ProblemDetails) {
		this.problemDetailsSub$.next(errors);
	}
}
