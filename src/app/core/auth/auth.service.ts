import { Injectable } from '@angular/core';
import { AuthAsyncService } from 'app/core/auth/auth-async.service';
import { tap, takeUntil, map, finalize, take, switchMap } from 'rxjs/operators';
import { AccessToken } from 'app/core/auth/models/access-token.model';
import * as Auth from './auth.store.actions';
import { Router } from '@angular/router';
import { LogService } from 'app/core/logger/log.service';
import { Store, Actions, ofActionCompleted } from '@ngxs/store';
import { JsonWebTokenService } from 'app/core/services/json-web-token.service';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material/dialog';
import { AuthDialogComponent } from '../../views/auth/auth-dialog/auth-dialog.component';
import { AuthDialogData } from 'app/core/auth/models/auth-dialog-data.model';
import { AuthState } from 'app/core/auth/auth.store.state';
import { Observable, of, interval, Subscription, merge } from 'rxjs';
import { AuthDialogUserDecision } from '../../views/auth/auth-dialog/auth-dialog-user-decision.enum';
import { InitSessionResult } from 'app/core/auth/models/init-session-result.model';

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
		this.log.trace('authenticate executed.', this);
		const userId = this.jwtService.getSubClaim(accessToken.access_token);
		this.store.dispatch(new Auth.Signin({ accessToken, userId }));
		this._maintainSession(staySignedIn || false, accessToken.expires_in);
	}

	/**
	 * Signs user out then navigates to [auth/sign-in].
	 */
	signOutUser(): void {
		this.log.trace('signOutUser executed.', this);
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
		this.log.trace('renewExpiredSessionOrSignUserOut executed.', this);
		// If token is valid treat as a successful sign in
		if (isAuthenticated) {
			this.log.trace('renewExpiredSessionOrSignUserOut: User is authenticated. Signing user in.', this);
			return this._signinAuthenticatedUser();
		}
		// if staySignedIn is true and user did not explicitly sign out. Treat as renew current session.
		else if (staySignedIn === true && didExplicitlySignout === false) {
			this.log.trace('renewExpiredSessionOrSignUserOut: User is not authenticated and they did not explicitly sign out. Renewing session.', this);
			return this._renewSessionFromExpiredSession();
		}
		// else if user did not explicitly sign out, sign them out.
		else {
			this.log.trace('renewExpiredSessionOrSignUserOut: User is not authenticated and session is not set to stay signed in. Signing user out.', this);
			return of(didExplicitlySignout).pipe(switchMap(() => this._signOutUserFromApplication(didExplicitlySignout)));
		}
	}

	/**
	 * Maintains user session.
	 * @param staySignedIn
	 * @param expires_in
	 */
	private _maintainSession(staySignedIn: boolean, expires_in: number): void {
		this.log.trace('maintainSession: Session exires in: ', this, expires_in);
		interval(expires_in * 1000 - this._timeOutInMs)
			.pipe(
				takeUntil(this.actions$.pipe(ofActionCompleted(Auth.Signout))),
				take(1),
				tap(() => (staySignedIn ? this._renewAccessTokenOrSignout() : this._initiateSignout()))
			)
			.subscribe();
	}

	/**
	 * Signs user out of the application.
	 */
	private _signOut(): Observable<void> {
		this.log.trace('signOut: Signing user from the server and dispatching Auth.Signout and Auth.KeepOrRemoveRememberMeUsername', this);
		return this.authAsyncService.signout().pipe(finalize(() => this.store.dispatch([new Auth.Signout(), new Auth.KeepOrRemoveRememberMeUsername()])));
	}

	/**
	 * Initializes new session for expired session.
	 * @returns session for expired session
	 */
	private _renewSessionFromExpiredSession(): Observable<InitSessionResult> {
		this.log.trace('_renewSessionFromExpiredSession executed.', this);
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
					this.log.debug('_renewSessionFromExpiredSession: retrieved userId from accessToken.', this);
					this.store.dispatch(new Auth.Signin({ accessToken: result.accessToken, userId: userId }));
					this.log.trace('_renewSessionFromExpiredSession: Dispatched Auth.Signin.', this);
				}
			})
		);
	}

	/**
	 * Signs user out. Only executed when certain conditions are met when the application first initializes.
	 * @returns out on init session
	 */
	private _signOutUserFromApplication(didExplicitlySignout: boolean): Observable<InitSessionResult> {
		this.log.trace('_signOutUserFromApplication executed.', this);
		const initSessionResult: InitSessionResult = {
			succeeded: false
		};
		if (didExplicitlySignout === false) {
			this.log.debug('_signOutUserFromApplication: User did not explicitly sign out. Signing user out.', this);
			return this._signOut().pipe(map(() => initSessionResult));
		}
		this.log.debug('_signOutUserFromApplication: User did explicitly sign out. Returning InitSessionResult only.', this);
		return of(initSessionResult);
	}

	/**
	 * Initializes session for authenticated user.
	 * @returns session for authenticated user
	 */
	private _signinAuthenticatedUser(): Observable<InitSessionResult> {
		this.log.trace('_signinAuthenticatedUser executed.', this);
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
		return this.store.dispatch(new Auth.Signin({ accessToken, userId })).pipe(
			tap(() => this.log.trace('_renewSessionFromExpiredSession: Dispatched Auth.Signin.', this)),
			map(() => result)
		);
	}

	/**
	 * Attempts to refresh access token, otherwise signs user out.
	 */
	private _renewAccessTokenOrSignout(): void {
		this.log.trace('_renewAccessTokenOrSignout executed.', this);
		const staySignedIn = this.store.selectSnapshot(AuthState.selectStaySignedIn);
		this.log.debug('_renewAccessTokenOrSignout: staySignedIn value: ', this, staySignedIn);
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
		this.log.trace('_initiateSignout executed.', this);
		staySignedIn ? this.signOutUser() : this._signoutWithDialogPrompt();
	}

	/**
	 * Signs user out with dialog prompt asking if user wants to renew session. Executed if user did not check 'Remember me' option.
	 */
	private _signoutWithDialogPrompt(): void {
		this.log.trace('_signoutWithDialogPrompt executed.', this);
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
						this.log.debug('_signoutWithDialogPrompt: User took action on the dialog. Autosignout is set to false. Closing dialog.', this);
						autoSignout = false;
						this.dialog.closeAll();
					})
				)
				.subscribe()
		);

		// close dialog after token has expired.
		setTimeout(() => {
			if (autoSignout) {
				this.log.trace(
					'_signoutWithDialogPrompt: User did not take action on the dialog. Autosignout is set to true. Closing dialog and signing user out.',
					this
				);
				this.dialog.closeAll();
				this.signOutUser();
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
		this.log.trace('_listenForDialogEvents executed.', this);
		return merge(dialogRef.componentInstance.staySignedInClicked, dialogRef.componentInstance.signOutClicked).pipe(
			tap((decision: AuthDialogUserDecision) =>
				decision === AuthDialogUserDecision.staySignedIn ? this._renewAccessTokenOrSignout() : this.signOutUser()
			)
		);
	}
}
