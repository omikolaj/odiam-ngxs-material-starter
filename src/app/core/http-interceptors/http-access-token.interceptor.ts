import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Store } from '@ngxs/store';
import { AuthState } from '../auth/auth.store.state';

/**
 * HttpAccessToken interceptor.
 */
@Injectable()
export class HttpAccessTokenInterceptor implements HttpInterceptor {
	/**
	 * Creates an instance of http access token interceptor.
	 * @param store
	 */
	constructor(private store: Store) {}

	/**
	 * Intercepts request going out and adds access token to it.
	 * @param request
	 * @param next
	 * @returns intercept
	 */
	intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
		const access_token = this.store.selectSnapshot(AuthState.selectAccessToken);
		request = request.clone({
			setHeaders: {
				Authorization: `Bearer ${access_token}`
			}
		});

		return next.handle(request);
	}
}
