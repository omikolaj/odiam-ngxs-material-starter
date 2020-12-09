/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, NEVER, throwError } from 'rxjs';
import { HttpStatusService } from '../http-status.service';
import { catchError } from 'rxjs/operators';
import { ProblemDetails } from '../models/problem-details.model';

@Injectable({
	providedIn: 'root'
})
export class HttpStatusInterceptor implements HttpInterceptor {
	constructor(private httpStatusService: HttpStatusService) {}
	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		return next.handle(req.clone()).pipe(
			catchError((e: HttpErrorResponse) => {
				if (e.status === 400) {
					const validationProblemDetails = e.error as ProblemDetails;
					if (validationProblemDetails.errors) {
						this.httpStatusService.validationErrors = e.error;
						return NEVER;
					}
				}
				return throwError(e);
			})
		);
	}
}
