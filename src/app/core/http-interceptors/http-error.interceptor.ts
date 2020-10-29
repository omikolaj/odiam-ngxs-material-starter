import { Injectable, ErrorHandler, Injector } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Passes HttpErrorResponse to application-wide error handler.
 */
@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
	/**
	 * Creates an instance of http error interceptor.
	 * @param injector used to get an instance of ErrorHandler.
	 */
	constructor(private injector: Injector) {}

	/**
	 * Intercepts http errors and performs global error handling.
	 * @param request
	 * @param next
	 * @returns HttpEvent<any>.*
	 */
	intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		return next.handle(request).pipe(
			tap({
				error: (err: any) => {
					if (err instanceof HttpErrorResponse) {
						const appErrorHandler = this.injector.get(ErrorHandler);
						appErrorHandler.handleError(err);
					}
				}
			})
		);
	}
}
