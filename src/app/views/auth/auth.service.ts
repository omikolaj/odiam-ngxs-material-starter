import { Injectable } from '@angular/core';
import { AuthAsyncService } from 'app/core/auth/auth-async.service';
import { tap, takeUntil } from 'rxjs/operators';
import { RenewAccessTokenResult } from 'app/core/auth/renew-access-token-result.model';
import { AccessToken } from 'app/core/auth/access-token.model';
import * as Auth from '../../core/auth/auth.store.actions';
import { Router } from '@angular/router';
import { LogService } from 'app/core/logger/log.service';
import { Store, Actions, ofActionCompleted } from '@ngxs/store';
import { JsonWebTokenService } from 'app/core/services/json-web-token.service';
import { MatDialog } from '@angular/material/dialog';
import { AuthDialogComponent } from './auth-dialog/auth-dialog.component';
import { AuthDialogData } from 'app/core/auth/auth-dialog-data.model';
import { AuthState } from 'app/core/auth/auth.store.state';
import { Subscription, timer } from 'rxjs';

/**
 * Auth service.
 */
@Injectable({
	providedIn: 'root'
})
export class AuthService {
	/**
	 * Minute in miliseconds.
	 */
	// private _timeOutInMs = 60000;
	private _timeOutInMs = 5000;

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
		private dialog: MatDialog,
		private actions$: Actions
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
		this._maintainSession(remember, token.expires_in);
	}

	/**
	 * Maintains current session.
	 * @param rememberMe
	 * @param expires_in
	 */
	private _maintainSession(rememberMe: boolean, expires_in: number): void {
		const sessionTimeout = timer(expires_in * 1000 - this._timeOutInMs);
		sessionTimeout
			.pipe(
				takeUntil(this.actions$.pipe(ofActionCompleted(Auth.Signout))),
				tap(() => {
					if (rememberMe) {
						this._signoutOrRenewAccessTokenModel();
					} else {
						this._initiateSignout();
					}
				})
			)
			.subscribe();
	}

	/**
	 * Attempts to refresh access token, otherwise signs user out.
	 */
	private _signoutOrRenewAccessTokenModel(): void {
		this.authAsyncService
			// try renew token
			.tryRenewAccessTokenModel()
			.pipe(
				tap((renewAccessTokenModelResult: RenewAccessTokenResult) => {
					const rememberMe = this.store.selectSnapshot(AuthState.selectRememberMe);
					if (renewAccessTokenModelResult.succeeded) {
						this.authenticate(renewAccessTokenModelResult.accessToken, rememberMe);
					} else {
						this._initiateSignout(rememberMe);
					}
				})
			)
			.subscribe();
	}

	/**
	 * Initiates signout procedure.
	 */
	private _initiateSignout(rememberMe?: boolean): void {
		this.log.trace('_initiateSignout fired.', this);
		// if remember me is true and were here, that would indicate that something
		// went wrong on the server when rewnewing jwt.
		if (rememberMe) {
			this.log.debug(
				`RememberMe option was set to ${rememberMe.toString()}, but we are in executing _initiateSignout method. This indicates renewing of jwt failed on the server. Check server logs.`
			);
			this.signOut();
		} else {
			this._signoutWithDialogPrompt();
		}
	}

	/**
	 * Signs user out with dialog prompt asking if user wants to renew session. Executed if user did not check 'Remember me' option.
	 */
	private _signoutWithDialogPrompt(): void {
		const dialogRef = this.dialog.open(AuthDialogComponent, {
			data: {
				timeUntilTimeoutSeconds: this._timeOutInMs / 1000
			} as AuthDialogData,
			closeOnNavigation: true
		});

		let autoSignout = true;
		const subscription = new Subscription();
		subscription.add(
			dialogRef.componentInstance.staySignedInClicked.subscribe(() => {
				this._signoutOrRenewAccessTokenModel();
				autoSignout = false;
				this.dialog.closeAll();
			})
		);

		subscription.add(
			dialogRef.componentInstance.signOutClicked.subscribe(() => {
				this.dialog.closeAll();
				this.signOut();
				autoSignout = false;
				this.dialog.closeAll();
			})
		);

		dialogRef.afterClosed().subscribe(() => subscription.unsubscribe());

		setTimeout(() => {
			if (autoSignout) {
				this.dialog.closeAll();
				this.signOut();
			}
		}, this._timeOutInMs);
	}

	/**
	 * Signs user out of the application.
	 */
	signOut(): void {
		this.authAsyncService.signout().subscribe();
		this.store.dispatch(new Auth.Signout());
		void this.router.navigate(['auth']);
	}
}
