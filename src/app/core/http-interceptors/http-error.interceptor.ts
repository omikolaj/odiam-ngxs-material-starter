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
	 * @param injector since error handling is really important it needs to be loaded first, thus making it not possible to use dependency injection in the constructor to get other services such as the error handle api service to send the server our error details.
	 */
	constructor(private injector: Injector) {}

	/**
	 * Intercepts http errors and performs global error handling.
	 * @param request
	 * @param next
	 * @returns HttpEvent<any>.
	 */
	intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<unknown>> {
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
