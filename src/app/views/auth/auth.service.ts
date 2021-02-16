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
import { SigninUser } from 'app/core/auth/signin-user.model';
import { UsersAsyncService } from 'app/core/services/users-async.service';

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
		private userAsyncService: UsersAsyncService,
		private router: Router,
		private log: LogService,
		private store: Store,
		private jwtService: JsonWebTokenService,
		private dialog: MatDialog,
		private actions$: Actions
	) {}

	/**
	 * Signs user in.
	 * @param model
	 */
	signinUser(model: SigninUser): void {
		this.authAsyncService
			.signin(model)
			.pipe(
				// only update remember user upon successful signin.
				tap(() => this._updateRememberUser(model.rememberMe, model.email)),
				tap((access_token) => this.authenticate(access_token, model.staySignedIn))
			)
			.subscribe();
	}

	/**
	 * Persists username.
	 */
	private _updateRememberUser(rememberMe: boolean, username: string): void {
		const user = rememberMe ? username : '';
		this.store.dispatch(new Auth.UpdateRememberUsername(user));
	}

	/**
	 * Authenticates user that has signed in or signed up.
	 * @param token
	 * @param [staySignedIn]
	 */
	authenticate(token: AccessToken, staySignedIn?: boolean): void {
		const userId = this.jwtService.getSubClaim(token.access_token);
		const signedin = staySignedIn || false;
		this.store.dispatch(new Auth.Signin({ accessToken: token, userId: userId }));
		void this.router.navigate(['account']);
		this._maintainSession(signedin, token.expires_in);
	}

	/**
	 * Maintains current session.
	 * @param staySignedIn
	 * @param expires_in
	 */
	private _maintainSession(staySignedIn: boolean, expires_in: number): void {
		const sessionTimeout = timer(expires_in * 1000 - this._timeOutInMs);
		sessionTimeout
			.pipe(
				takeUntil(this.actions$.pipe(ofActionCompleted(Auth.Signout))),
				tap(() => {
					if (staySignedIn) {
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
					const staySignedIn = this.store.selectSnapshot(AuthState.selectStaySignedIn);
					if (renewAccessTokenModelResult.succeeded) {
						this.authenticate(renewAccessTokenModelResult.accessToken, staySignedIn);
					} else {
						this._initiateSignout(staySignedIn);
					}
				})
			)
			.subscribe();
	}

	/**
	 * Initiates signout procedure.
	 */
	private _initiateSignout(staySignedIn?: boolean): void {
		this.log.trace('_initiateSignout fired.', this);
		// if remember me is true and were here, that would indicate that something
		// went wrong on the server when rewnewing jwt.
		if (staySignedIn) {
			this.log.debug(
				`StaySignedin option was set to ${staySignedIn.toString()}, but we are in executing _initiateSignout method. This indicates renewing of jwt failed on the server. Check server logs.`
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
