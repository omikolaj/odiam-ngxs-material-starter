/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, NEVER, throwError } from 'rxjs';
import { ServerErrorService } from '../error-handler/server-error.service';
import { catchError } from 'rxjs/operators';
import { ProblemDetails } from '../models/problem-details.model';
import { InternalServerErrorDetails } from '../models/internal-server-error-details.model';
import { implementsOdmWebApiException } from '../utilities/implements-odm-web-api-exception';

/**
 * Http status interceptor. Controls if ProblemDetails or InternalServerErrorDetails emit errors.
 */
@Injectable({
	providedIn: 'root'
})
export class HttpStatusInterceptor implements HttpInterceptor {
	/**
	 * Creates an instance of http status interceptor.
	 * @param _serverErrorService
	 */
	constructor(private _serverErrorService: ServerErrorService) {}

	/**
	 * Intercepts requests checking for specific http status codes.
	 * @param req
	 * @param next
	 * @returns intercept
	 */
	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<unknown>> {
		return next.handle(req.clone()).pipe(
			catchError((e: HttpErrorResponse) => {
				return this._handleError$(e);
			})
		);
	}

	/**
	 * Handles http errors.
	 * @param e
	 * @returns error$
	 */
	private _handleError$(e: HttpErrorResponse): Observable<HttpEvent<unknown>> {
		switch (e.status) {
			case 400:
				this._serverErrorService.problemDetails = e.error as ProblemDetails;
				return NEVER;
			case 401:
			case 403:
				this._serverErrorService.problemDetails = e.error as ProblemDetails;
				return throwError(e);
			case 500: {
				const internalServerError = e.error as InternalServerErrorDetails;
				// if this is OdmApiException it implements same interface as problem details
				if (implementsOdmWebApiException(internalServerError)) {
					this._serverErrorService.internalServerErrorDetails = e.error as InternalServerErrorDetails;

					// internal server error cannot return NEVER because of issues getting reference to
					// @InternalServerDetailError very early on in the bootstraping of the application.
					// NOT returning NEVER allows parts of the app to use .catchError() and handle possible server down scenarios.
					// @ProblemDetails is not a problem because when server responds with 40X it indicates the server is running and some internal process failed.
					return throwError(internalServerError);
				}

				const error = {
					status: e.status,
					message: e.error
				} as InternalServerErrorDetails;

				this._serverErrorService.internalServerErrorDetails = error;

				return throwError(error);
			}
			case 504: {
				const error = {
					status: e.status,
					message: 'Server is down.'
				} as InternalServerErrorDetails;

				this._serverErrorService.internalServerErrorDetails = error;

				// internal server error cannot return NEVER because of issues getting reference to
				// @InternalServerDetailError very early on in the bootstraping of the application.
				// NOT returning NEVER allows parts of the app to use .catchError() and handle possible server down scenarios.
				// @ProblemDetails is not a problem because when server responds with 40X it indicates the server is running and some internal process failed.
				return throwError(error);
			}
		}
	}
}
