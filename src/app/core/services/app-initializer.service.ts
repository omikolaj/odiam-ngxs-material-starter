import { Injectable } from '@angular/core';
import { InitSessionResult } from '../auth/models/init-session-result.model';
import { Store } from '@ngxs/store';
import { AuthService } from '../auth/auth.service';
import { LogService } from '../logger/log.service';
import { AuthState } from '../auth/auth.store.state';

/**
 * App initializer service.
 */
@Injectable({
	providedIn: 'root'
})
export class AppInitializerService {
	/**
	 * Creates an instance of app initializer service.
	 * @param store
	 * @param authService
	 * @param log
	 */
	constructor(private store: Store, private authService: AuthService, private log: LogService) {}

	/**
	 * Initializes user's session.
	 * @returns user session
	 */
	initUserSession(): Promise<void> {
		this.log.trace('initUserSession executing.', this);
		const isAuthenticated = this.store.selectSnapshot(AuthState.selectIsAuthenticated);
		this.log.debug('[initUserSession] isAuthenticated:', this, isAuthenticated);
		const staySignedIn = this.store.selectSnapshot(AuthState.selectStaySignedIn);
		this.log.debug('[initUserSession] staySignedIn:', this, staySignedIn);
		const explicitlySignedOut = this.store.selectSnapshot(AuthState.selectDidUserExplicitlySignout);
		this.log.debug('[initUserSession] explicitlySignedOut:', this, explicitlySignedOut);
		const promise = this.authService
			.initUserSession(isAuthenticated, staySignedIn, explicitlySignedOut)
			.toPromise<InitSessionResult>()
			.then((result) => {
				this.log.debug('[initUserSession] result:', this, result.succeeded);
				if (result.succeeded) {
					this.log.debug('[initUserSession] accesstoken:', this, result.accessToken.expires_in);
					this.authService.authenticate(result.accessToken, staySignedIn);
				}
			});

		return promise;
	}
}
