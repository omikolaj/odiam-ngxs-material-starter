/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, NEVER, throwError } from 'rxjs';
import { ServerErrorService } from '../error-handler/server-error.service';
import { catchError } from 'rxjs/operators';
import { ProblemDetails } from '../models/problem-details.model';
import { InternalServerErrorDetails } from '../models/internal-server-error-details.model';
import { implementsOdmWebApiException } from '../utilities/implements-odm-web-api-exception';

@Injectable({
	providedIn: 'root'
})
export class HttpStatusInterceptor implements HttpInterceptor {
	/**
	 * Creates an instance of http status interceptor.
	 * @param serverErrorService
	 */
	constructor(private serverErrorService: ServerErrorService) {}

	/**
	 * Intercepts requests checking for specific http status codes.
	 * @param req
	 * @param next
	 * @returns intercept
	 */
	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<unknown>> {
		return next.handle(req.clone()).pipe(
			catchError((e: HttpErrorResponse) => {
				if (e.status === 400 || e.status === 401) {
					// check if we have validation problem details
					this.serverErrorService.problemDetails = e.error as ProblemDetails;
					return NEVER;
				} else if (e.status === 500 || e.status === 504) {
					const internalServerError = e.error as InternalServerErrorDetails;
					// if this is OdmApiException it implements same interface as problem details
					if (implementsOdmWebApiException(internalServerError)) {
						this.serverErrorService.internalServerErrorDetails = e.error as InternalServerErrorDetails;
						return throwError(internalServerError);
					}

					// eslint-disable-next-line prefer-const
					let error = {
						status: e.status,
						message: e.error
					} as InternalServerErrorDetails;

					// server is most likely down
					if (e.status === 504) {
						error.message = `Server is down.`;
					}

					this.serverErrorService.internalServerErrorDetails = error;

					return throwError(error);
				}
			})
		);
	}
}