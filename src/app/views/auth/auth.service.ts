import { Injectable, Inject } from '@angular/core';
import { AuthAsyncService } from 'app/core/auth/auth-async.service';
import { tap } from 'rxjs/operators';
import { RenewAccessTokenResult } from 'app/core/auth/renew-access-token-result.model';
import { AccessToken } from 'app/core/auth/access-token.model';
import * as Auth from '../../core/auth/auth.store.actions';
import { Router } from '@angular/router';
import { LogService } from 'app/core/logger/log.service';
import { Store } from '@ngxs/store';
import { JsonWebTokenService } from 'app/core/services/json-web-token.service';
import { MatDialog } from '@angular/material/dialog';
import { AuthDialogComponent } from './auth-dialog/auth-dialog.component';

/**
 * Auth service.
 */
@Injectable({
	providedIn: 'root'
})
export class AuthService {
	/**
	 * Creates an instance of auth service.
	 * @param authAsyncService
	 * @param router
	 * @param log
	 * @param store
	 * @param jwtService
	 */
	constructor(
		private authAsyncService: AuthAsyncService,
		private router: Router,
		private log: LogService,
		private store: Store,
		private jwtService: JsonWebTokenService,
		private dialog: MatDialog
	) {}

	/**
	 * Authenticates user that has signed in or signed up.
	 * @param token
	 * @param [rememberMe]
	 */
	authenticate(token: AccessToken, rememberMe?: boolean): void {
		const userId = this.jwtService.getSubClaim(token.access_token);
		const remember = rememberMe || false;
		this.store.dispatch(new Auth.Signin({ accessToken: token, rememberMe: remember, userId: userId }));
		void this.router.navigate(['account']);
		setTimeout(() => {
			this._signoutOrRenewAccessTokenModel(remember);
		}, token.expires_in * 1000);
	}

	/**
	 * Attempts to refresh access token, otherwise signs user out.
	 */
	private _signoutOrRenewAccessTokenModel(rememberMe: boolean): void {
		if (rememberMe) {
			this.authAsyncService
				// try renew token
				.tryRenewAccessTokenModel()
				.pipe(
					tap((renewAccessTokenModelResult: RenewAccessTokenResult) => {
						if (renewAccessTokenModelResult.succeeded) {
							this.authenticate(renewAccessTokenModelResult.accessToken);
						} else {
							this._initiateSignout();
						}
					})
				)
				.subscribe();
		} else {
			return this._initiateSignout();
		}
	}

	/**
	 * Initiates signout procedure.
	 */
	private _initiateSignout(): void {
		this.log.trace('_initiateSignout fired.', this);
		this.dialog.open(AuthDialogComponent, {
			closeOnNavigation: true
		});
	}
}
