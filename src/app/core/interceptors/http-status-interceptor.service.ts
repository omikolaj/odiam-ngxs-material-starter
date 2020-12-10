/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, NEVER, throwError } from 'rxjs';
import { ProblemDetailsService } from '../error-handler/problem-details.service';
import { catchError } from 'rxjs/operators';
import { ProblemDetails } from '../models/problem-details.model';

@Injectable({
	providedIn: 'root'
})
export class HttpStatusInterceptor implements HttpInterceptor {
	constructor(private ProblemDetailsService: ProblemDetailsService) {}
	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		return next.handle(req.clone()).pipe(
			catchError((e: HttpErrorResponse) => {
				const problemDetails = e.error as ProblemDetails;
				if (e.status === 400) {
					// check if we have validation problem details
					if (problemDetails.errors) {
						this.ProblemDetailsService.problemDetails = e.error;
						return NEVER;
					}
				} else if (e.status === 401) {
					this.ProblemDetailsService.problemDetails = e.error;
					return NEVER;
				}
			})
		);
	}
}
