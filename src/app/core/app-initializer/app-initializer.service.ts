import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { AuthService } from '../auth/auth.service';
import { LogService } from '../logger/log.service';
import { AuthState } from '../auth/auth.store.state';
import { InitSessionResult } from '../models/auth/init-session-result.model';
import { Router } from '@angular/router';

/**
 * App initializer service.
 */
@Injectable({
	providedIn: 'root'
})
export class AppInitializerService {
	/**
	 * Creates an instance of app initializer service.
	 * @param _store
	 * @param _authService
	 * @param _log
	 */
	constructor(private _store: Store, private _router: Router, private _authService: AuthService, private _log: LogService) {}

	/**
	 * Initializes user's session.
	 * @returns user session
	 */
	initUserSession(): Promise<any> {
		this._log.trace('initUserSession executing.', this);
		const isAuthenticated = this._store.selectSnapshot(AuthState.selectIsAuthenticated);
		this._log.debug('[initUserSession] isAuthenticated:', this, isAuthenticated);
		const explicitlySignedOut = this._store.selectSnapshot(AuthState.selectDidUserExplicitlySignout);
		this._log.debug('[initUserSession] explicitlySignedOut:', this, explicitlySignedOut);
		const promise = this._authService
			.initUserSession$(isAuthenticated, explicitlySignedOut)
			.toPromise<InitSessionResult>()
			.then((result) => {
				this._log.debug('[initUserSession] result:', this, result.succeeded);
				if (result.succeeded) {
					this._log.debug('[initUserSession] authenticating user.', this);
					// eslint-disable-next-line @typescript-eslint/no-unsafe-return
					return this._authService
						.authenticate$(result.accessToken)
						.toPromise()
						.then(() => {
							void this._authService.monitorSessionActivity$().toPromise();
							this._log.debug('[initUserSession] monitorSessionActivity$ executed.', this);
						});
				}
				if (result.error) {
					this._log.debug('[initUserSession] Signing user out.', this);
					return this._authService
						.signUserOut$()
						.toPromise()
						.then(() => void this._router.navigate(['auth/sign-in']));
				}
			});

		return promise;
	}
}
