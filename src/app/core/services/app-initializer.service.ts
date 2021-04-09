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
	initUserSession(): Promise<any> {
		this.log.trace('initUserSession executing.', this);
		const isAuthenticated = this.store.selectSnapshot(AuthState.selectIsAuthenticated);
		this.log.debug('[initUserSession] isAuthenticated:', this, isAuthenticated);
		const explicitlySignedOut = this.store.selectSnapshot(AuthState.selectDidUserExplicitlySignout);
		this.log.debug('[initUserSession] explicitlySignedOut:', this, explicitlySignedOut);
		const promise = this.authService
			.initUserSession$(isAuthenticated, explicitlySignedOut)
			.toPromise<InitSessionResult>()
			.then((result) => {
				this.log.debug('[initUserSession] result:', this, result.succeeded);
				if (result.succeeded) {
					this.log.debug('[initUserSession] authenticating user.', this);
					// eslint-disable-next-line @typescript-eslint/no-unsafe-return
					return this.authService
						.authenticate$(result.accessToken)
						.toPromise()
						.then(() => {
							void this.authService.monitorSessionActivity$().toPromise();
							this.log.debug('[initUserSession] monitorSessionActivity$ executed.', this);
						});
				}
				if (result.error) {
					this.log.debug('[initUserSession] Signing user out.', this);
					return this.authService.signUserOut$().toPromise();
				}
			});

		return promise;
	}
}
