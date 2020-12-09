import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { ProblemDetails } from './models/problem-details.model';

@Injectable({
	providedIn: 'root'
})
export class HttpStatusService {
	private validationErrorsSub$ = new Subject<ProblemDetails>();

	getValidationErrors$: Observable<ProblemDetails> = this.validationErrorsSub$.asObservable();

	set validationErrors(errors: ProblemDetails) {
		this.validationErrorsSub$.next(errors);
	}
}
