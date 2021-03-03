import { Injectable } from '@angular/core';
import { AuthAsyncService } from 'app/core/auth/auth-async.service';
import { tap, takeUntil, map, finalize, take, switchMap } from 'rxjs/operators';
import { AccessToken } from 'app/core/auth/access-token.model';
import * as Auth from '../../core/auth/auth.store.actions';
import { Router } from '@angular/router';
import { LogService } from 'app/core/logger/log.service';
import { Store, Actions, ofActionCompleted } from '@ngxs/store';
import { JsonWebTokenService } from 'app/core/services/json-web-token.service';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material/dialog';
import { AuthDialogComponent } from './auth-dialog/auth-dialog.component';
import { AuthDialogData } from 'app/core/auth/auth-dialog-data.model';
import { AuthState } from 'app/core/auth/auth.store.state';
import { Observable, of, interval, Subscription, merge } from 'rxjs';
import { AuthDialogUserDecision } from './auth-dialog/auth-dialog-user-decision.enum';
import { InitSessionResult } from 'app/core/auth/init-session-result.model';

/**
 * Auth service.
 */
@Injectable({
	providedIn: 'root'
})
export class AuthService {
	/**
	 * Timeout in miliseconds.
	 */

	private _timeOutInMs = 5000;

	/**
	 * Auth dialog configuration. Initialized in the constructor.
	 */
	private _authDialogConfig: MatDialogConfig;

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
	) {
		this._authDialogConfig = {
			data: {
				timeUntilTimeoutSeconds: this._timeOutInMs / 1000
			} as AuthDialogData,
			closeOnNavigation: true,
			disableClose: true
		};
	}

	/**
	 * Authenticates user that has signed in or signed up.
	 * @param token
	 * @param [staySignedIn]
	 */
	authenticate(accessToken: AccessToken, staySignedIn?: boolean): void {
		this.log.trace('authenticate fired.', this);
		const userId = this.jwtService.getSubClaim(accessToken.access_token);
		this.store.dispatch(new Auth.Signin({ accessToken, userId }));
		this._maintainSession(staySignedIn || false, accessToken.expires_in);
	}

	/**
	 * Signs user out of the application.
	 */
	signUserOut(): void {
		this._signOut()
			.pipe(tap(() => void this.router.navigate(['auth/sign-in'])))
			.subscribe();
	}

	/**
	 * Renews expired session or sign user out depending on their configured options.
	 * @param isAuthenticated
	 * @param staySignedIn
	 * @param didExplicitlySignout
	 * @returns expired session or sign user out
	 */
	renewExpiredSessionOrSignUserOut(isAuthenticated: boolean, staySignedIn: boolean, didExplicitlySignout: boolean): Observable<InitSessionResult> {
		// If token is valid treat as a successful sign in
		if (isAuthenticated) {
			this.log.trace('onInitSession, user is authenticated. Authenticating user.');
			return this._initSessionForAuthenticatedUser();
		}
		// if staySignedIn is true and user did not explicitly sign out. Treat as renew current session.
		else if (staySignedIn === true && didExplicitlySignout === false) {
			this.log.trace('onInitSession, user is not authenticated and they did not explicitly sign out. Renewing session.');
			return this._initNewSessionFromExpiredSession();
		}
		// else if user did not explicitly sign out, sign them out.
		else {
			this.log.trace('onInitSession, user is not authenticated. Did user explicitly sign out: ', this, didExplicitlySignout);
			return of(didExplicitlySignout).pipe(switchMap(() => this._signOutOnInitSession(didExplicitlySignout)));
		}
	}

	/**
	 * Maintains user session.
	 * @param staySignedIn
	 * @param expires_in
	 */
	private _maintainSession(staySignedIn: boolean, expires_in: number): void {
		this.log.trace('maintainSession fired. Session exires in: ', this, expires_in);
		interval(expires_in * 1000 - this._timeOutInMs)
			.pipe(
				takeUntil(this.actions$.pipe(ofActionCompleted(Auth.Signout))),
				take(1),
				tap(() => (staySignedIn ? this._signoutOrRenewAccessToken() : this._initiateSignout()))
			)
			.subscribe();
	}

	/**
	 * Signs user out of the application.
	 */
	private _signOut(): Observable<void> {
		this.log.trace('signOut fired. Navigating to auth/sign-in and signing user out of the app.', this);
		return this.authAsyncService.signout().pipe(
			finalize(() => {
				this.store.dispatch(new Auth.Signout());
			})
		);
	}

	/**
	 * Initializes new session for expired session.
	 * @returns session for expired session
	 */
	private _initNewSessionFromExpiredSession(): Observable<InitSessionResult> {
		return this.authAsyncService.tryRenewAccessToken().pipe(
			map((result) => {
				return {
					succeeded: result.succeeded,
					accessToken: result.accessToken
				} as InitSessionResult;
			}),
			tap((result) => {
				if (result.succeeded) {
					const userId = this.jwtService.getSubClaim(result.accessToken.access_token);
					this.store.dispatch(new Auth.Signin({ accessToken: result.accessToken, userId: userId }));
				}
			})
		);
	}

	/**
	 * Signs user out. Only executed when certain conditions are met when the application first initializes.
	 * @returns out on init session
	 */
	private _signOutOnInitSession(didExplicitlySignout: boolean): Observable<InitSessionResult> {
		const initSessionResult: InitSessionResult = {
			succeeded: false
		};
		if (didExplicitlySignout === false) {
			return this._signOut().pipe(map(() => initSessionResult));
		}
		return of(initSessionResult);
	}

	/**
	 * Initializes session for authenticated user.
	 * @returns session for authenticated user
	 */
	private _initSessionForAuthenticatedUser(): Observable<InitSessionResult> {
		// Grab the access token.
		const accessToken: AccessToken = {
			access_token: this.store.selectSnapshot(AuthState.selectAccessToken),
			expires_in: this.store.selectSnapshot(AuthState.selectExpiresInSeconds)
		};

		// decode user id from the access token.
		const userId = this.jwtService.getSubClaim(accessToken.access_token);

		// set the initialize session result.
		const result: InitSessionResult = {
			succeeded: true,
			accessToken
		};

		// sign user in then return the result.
		return this.store.dispatch(new Auth.Signin({ accessToken, userId })).pipe(map(() => result));
	}

	/**
	 * Attempts to refresh access token, otherwise signs user out.
	 */
	private _signoutOrRenewAccessToken(): void {
		const staySignedIn = this.store.selectSnapshot(AuthState.selectStaySignedIn);
		this.authAsyncService
			.tryRenewAccessToken()
			.pipe(
				tap((renewAccessTokenModelResult) =>
					renewAccessTokenModelResult.succeeded
						? this.authenticate(renewAccessTokenModelResult.accessToken, staySignedIn)
						: this._initiateSignout(staySignedIn)
				)
			)
			.subscribe();
	}

	/**
	 * Initiates signout procedure.
	 */
	private _initiateSignout(staySignedIn?: boolean): void {
		this.log.trace('_initiateSignout fired.', this);
		staySignedIn ? this.signUserOut() : this._signoutWithDialogPrompt();
	}

	/**
	 * Signs user out with dialog prompt asking if user wants to renew session. Executed if user did not check 'Remember me' option.
	 */
	private _signoutWithDialogPrompt(): void {
		this.log.trace('_signoutWithDialogPrompt fired.', this);
		// open up auth dialog.
		const dialogRef = this.dialog.open(AuthDialogComponent, this._authDialogConfig);
		const subscription = new Subscription();
		// if user takes no action when dialog is displayed, treat it as autoSignout.
		let autoSignout = true;

		// subscribe to dialog events. User can click wither staySignedIn or signout.
		subscription.add(
			this._listenForDialogEvents(dialogRef)
				.pipe(
					tap(() => {
						this.log.trace('_signoutWithDialogPrompt user took action on the dialog. Autosignout is set to false. Closing dialog.', this);
						autoSignout = false;
						this.dialog.closeAll();
					})
				)
				.subscribe()
		);

		// close dialog after token has expired.
		setTimeout(() => {
			if (autoSignout) {
				this.log.trace('_signoutWithDialogPrompt setTimeout function executing. Closing dialog and signing user out.', this);
				this.dialog.closeAll();
				this.signUserOut();
			}
		}, this._timeOutInMs);

		dialogRef.afterClosed().subscribe(() => subscription.unsubscribe());
	}

	/**
	 * Listens for auth dialog events. User can either choose to stay signed in, sign out or take no action. Treated as signout.
	 * @param dialogRef
	 * @returns for dialog events
	 */
	private _listenForDialogEvents(dialogRef: MatDialogRef<AuthDialogComponent, any>): Observable<AuthDialogUserDecision> {
		return merge(dialogRef.componentInstance.staySignedInClicked, dialogRef.componentInstance.signOutClicked).pipe(
			tap((decision: AuthDialogUserDecision) =>
				decision === AuthDialogUserDecision.staySignedIn ? this._signoutOrRenewAccessToken() : this.signUserOut()
			)
		);
	}
}
