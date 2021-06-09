import { Injectable } from '@angular/core';
import { AuthAsyncService } from 'app/core/auth/auth-async.service';
import { tap, map, finalize, switchMap, takeUntil, take, catchError } from 'rxjs/operators';
import * as Auth from './auth.store.actions';
import { Router } from '@angular/router';
import { LogService } from 'app/core/logger/log.service';
import { Store, Actions, ofActionCompleted } from '@ngxs/store';
import { JsonWebTokenService } from 'app/core/auth/json-web-token.service';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material/dialog';
import { AuthDialogComponent } from '../../views/auth/auth-dialog/auth-dialog.component';
import { AuthState } from 'app/core/auth/auth.store.state';
import { Observable, of, timer, race, throwError } from 'rxjs';
import { AuthDialogUserDecision } from '../models/auth/auth-dialog-user-decision.enum';
import { fromUnixTime } from 'date-fns';
import { UserSessionActivityService } from '../user-session-activity/user-session-activity.service';
import { AuthDialogData } from '../models/auth/auth-dialog-data.model';
import { InitSessionResult } from '../models/auth/init-session-result.model';
import { RenewAccessTokenResult } from '../models/auth/renew-access-token-result.model';
import { AccessToken } from '../models/auth/access-token.model';

/**
 * Authentication service, responsible for handling user session.
 */
@Injectable({
	providedIn: 'root'
})
export class AuthService {
	/**
	 * Timeout in miliseconds.
	 */
	private readonly _authDialogTimeoutInMs = 10000;

	/**
	 * Auth dialog configuration. Initialized in the constructor.
	 */
	private _authDialogConfig: MatDialogConfig;

	/**
	 * Creates an instance of auth service.
	 * @param _authAsyncService
	 * @param _router
	 * @param _log
	 * @param _store
	 * @param _jwtService
	 */
	constructor(
		private _authAsyncService: AuthAsyncService,
		private _userActivityService: UserSessionActivityService,
		private _store: Store,
		private _actions$: Actions,
		private _router: Router,
		private _jwtService: JsonWebTokenService,
		private _dialog: MatDialog,
		private _log: LogService
	) {
		this._authDialogConfig = {
			data: {
				timeUntilTimeoutSeconds: this._authDialogTimeoutInMs / 1000
			} as AuthDialogData,
			closeOnNavigation: true,
			disableClose: true
		};
	}

	/**
	 * Attempts to sign user in if two step authentication is not required, else proceeds with two step verification process.
	 * @param accessToken
	 * @returns authenticate
	 */
	processUserAuthentication$(
		accessToken?: AccessToken,
		rememberMe?: boolean,
		email?: string,
		is2StepVerificationRequired?: boolean,
		provider?: string
	): Observable<any> {
		this._log.trace('processUserAuthentication$ executed.', this);

		this.updateRememberMeUserName(rememberMe, email);

		return this._processAuthentication$(accessToken, email, is2StepVerificationRequired, provider);
	}

	/**
	 * Updates saved user's email.
	 * @param rememberMe
	 * @param email
	 */
	updateRememberMeUserName(rememberMe: boolean, email: string): void {
		if (rememberMe) {
			this._log.debug('[_updateRememberMeUserName$]: rememberMe option is selected.', email);
			this._store.dispatch(new Auth.UpdateRememberMeUsername({ username: email }));
		}
	}

	/**
	 * Processes user authentication.
	 * @param [accessToken]
	 * @param [email]
	 * @param [is2StepVerificationRequired]
	 * @param [provider]
	 * @returns authentication$
	 */
	private _processAuthentication$(
		accessToken?: AccessToken,
		email?: string,
		is2StepVerificationRequired?: boolean,
		provider?: string
	): Observable<any> {
		this._log.trace('_processAuthentication$ executed.', this);
		if (is2StepVerificationRequired) {
			return this._requires2StepVerification$(provider, email);
		}

		return this.authenticate$(accessToken).pipe(switchMap(() => this.monitorSessionActivity$()));
	}

	/**
	 * Navigates user to two step verification component for two step verification process.
	 * @param provider
	 * @returns step verification$
	 */
	private _requires2StepVerification$(provider: string, email: string): Observable<any> {
		this._log.trace('_requires2StepVerification$ executed.', this);
		if (provider) {
			void this._router.navigate(['auth/two-step-verification'], { queryParams: { provider, email } });

			return this._store.dispatch(new Auth.Is2StepVerificationRequired({ is2StepVerificationRequired: true }));
		} else {
			this._log.error('[_requires2StepVerification$]: Provider was not defined. Two step logging will fail.');
		}
	}

	/**
	 * Authenticates user with the app by signing them in.
	 * @param accessToken
	 * @param rememberMe
	 * @param email
	 * @returns authenticate$
	 */
	authenticate$(accessToken: AccessToken): Observable<any> {
		this._log.trace('_authenticate$ executed.', this);
		void this._router.navigate(['account']);

		const userId = this._jwtService.getSubClaim(accessToken.access_token);
		return this._store.dispatch(new Auth.Signin({ accessToken, userId }));
	}

	/**
	 * Monitors user's session activity.
	 * @param isAuthenticatedFunc
	 * @param expires_at
	 * @returns session activity
	 */
	monitorSessionActivity$(): Observable<any> {
		this._log.trace('monitorUserSessionActivity$ executed.', this);
		const isAuthenticatedFunc = this._store.selectSnapshot(AuthState.selectIsAuthenticatedFunc);
		return this._userActivityService.monitorSessionActivity$().pipe(
			takeUntil(this._actions$.pipe(ofActionCompleted(Auth.Signout))),
			tap(() => this._userActivityService.stopActivityTimer()),
			switchMap((isActive) => this._manageUserSession$(isAuthenticatedFunc, isActive)),
			tap(() => this._userActivityService.startActivityTimer())
		);
	}

	/**
	 * Renews expired session token or signs user out.
	 * @param isAuthenticated
	 * @param staySignedIn
	 * @param didExplicitlySignout
	 * @returns result of session initialization.
	 */
	initUserSession$(isAuthenticated: boolean, didExplicitlySignout: boolean): Observable<InitSessionResult> {
		this._log.trace('initUserSession executed.', this);
		// If user is authenticated, treat it as a signin.
		if (isAuthenticated) {
			this._log.trace('initUserSession$: User is authenticated.', this);
			return this._setInitSessionResultForAuthenticatedUser$();
		}
		// If user is not authenticated and user did NOT explicitly sign out, try to renew their session.
		if (didExplicitlySignout === false) {
			this._log.trace('initUserSession$: User is not authenticated and did not explicitly sign out. Attempting to renewing session.', this);
			return this._tryRenewSession$();
		}
		// else if user did not explicitly sign out, sign them out.
		else {
			this._log.trace('initUserSession$: User is not authenticated and user explicitly signed out. Ensuring user is signed out.', this);
			return this._ensureUserIsSignedout$();
		}
	}

	/**
	 * Signs user out.
	 * @returns any
	 */
	signUserOut$(): Observable<any> {
		this._log.trace('signUserOut$ executed.', this);
		return this._authAsyncService.signout$().pipe(
			catchError((err) => {
				return throwError(err);
			}),
			finalize(() => {
				void this._router.navigate(['auth/sign-in']);
				this._store.dispatch([new Auth.Signout(), new Auth.KeepOrRemoveRememberMeUsername()]);
				this._userActivityService.cleanUp();
			})
		);
	}

	/**
	 * Manages user session.
	 * @param isAuthenticatedFunc
	 * @param expires_at
	 * @param isActive
	 * @returns any
	 */
	private _manageUserSession$(isAuthenticatedFunc: (date: Date, expires_at: Date) => boolean, isActive: boolean): Observable<any> {
		this._log.trace('_manageUserSession$ executed.', this);
		const expires_at_raw = this._store.selectSnapshot(AuthState.selectExpiresAtRaw);
		const expires_at_date = fromUnixTime(expires_at_raw);

		// isAuthenticatedFunc has to be a function otherwise isAuthenticated from the stored gets cached and we
		// get outdated value.
		if (isAuthenticatedFunc(new Date(), expires_at_date)) {
			this._log.trace('[_manageUserSession$]: User is authenticated.', this);
			return this._handleAuthenticatedUserSession$(isActive);
		} else {
			this._log.trace('[_manageUserSession$]: User is not authenticated.', this);
			return this._handleUnauthenticatedUserSession$(isActive);
		}
	}

	/**
	 * Handles authenticated user session and checks if user is active.
	 * @param isActive
	 * @returns any
	 */
	private _handleAuthenticatedUserSession$(isActive: boolean): Observable<any> {
		this._log.trace('_handleAuthenticatedUserSession$ executed.', this);
		if (isActive === false) {
			this._log.trace('[_handleAuthenticatedUserSession$] User is not active.');
			return this._handleSessionInactivity$();
		} else {
			this._log.trace('[_handleAuthenticatedUserSession$] User is active.');
			return of(true);
		}
	}

	/**
	 * Handles unauthenticated user session and checks if user is active.
	 * @param isActive
	 * @returns any
	 */
	private _handleUnauthenticatedUserSession$(isActive: boolean): Observable<any> {
		this._log.trace('_handleUnauthenticatedUserSession$ executed.', this);
		if (isActive === false) {
			this._log.debug('[_handleUnauthenticatedUserSession$] User is not active.', this);
			return this._handleSessionHasEnded$();
		} else {
			this._log.debug('[_handleUnauthenticatedUserSession$] User is active.', this);
			return this._tryRenewAccessToken$();
		}
	}

	/**
	 * Handles displaying dialog for user whose session has been inactive.
	 * @returns any
	 */
	private _handleSessionInactivity$(): Observable<any> {
		this._log.trace('_handleSessionInactivity$ executed.', this);
		(this._authDialogConfig.data as AuthDialogData).message = 'You are about to be signed out due to inactivity.';
		return this._promptDialog$('inactive');
	}

	/**
	 * Handles displaying dialog for user whose session has ended.
	 * @returns any
	 */
	private _handleSessionHasEnded$(): Observable<any> {
		this._log.trace('_handleSessionHasEnded$ executed.', this);
		(this._authDialogConfig.data as AuthDialogData).message = 'Your session is expired and you are about to be signed out.';
		return this._promptDialog$('expired');
	}

	/**
	 * Tries to renew access token.
	 * @returns any
	 */
	private _tryRenewAccessToken$(): Observable<any> {
		this._log.trace('_tryRenewAccessToken$ executed.', this);
		return this._authAsyncService.tryRenewAccessToken$().pipe(
			switchMap((result) => {
				this._log.debug('[_tryRenewAccessToken$]: succeeded:', this, result.succeeded);
				return this._updateUserSession$(result);
			})
		);
	}

	/**
	 * Checks if access token renewal was successful. If yes, authenticates user with the app else signs them out.
	 * @param result
	 * @returns any
	 */
	private _updateUserSession$(result: RenewAccessTokenResult): Observable<any> {
		this._log.trace('_updateUserSession$ executed.', this);
		if (result.succeeded) {
			this._log.debug('[_updateUserSession$] result succeeded.', this);
			return this.authenticate$(result.accessToken);
		} else {
			this._log.debug('[_updateUserSession$] result failed.', this);
			return this.signUserOut$();
		}
	}

	/**
	 * Displays the auth dialog.
	 * @returns any
	 */
	private _promptDialog$(type: 'inactive' | 'expired'): Observable<any> {
		this._log.trace('_promptDialog$ executed.', this);
		const dialogRef = this._dialog.open(AuthDialogComponent, this._authDialogConfig);
		const userActions$ = this._listenForDialogEvents$(dialogRef, type);
		const userTookNoActions$ = timer(this._authDialogTimeoutInMs).pipe(
			take(1),
			switchMap(() => this.signUserOut$()),
			tap(() => this._dialog.closeAll())
		);

		return race(userActions$, userTookNoActions$);
	}

	/**
	 * Listens for auth dialog events. User can either:
	 * 1. Choose to stay signed in.
	 * 2. Choose to end the session.
	 * 3. Take no action, treated as end session.
	 * @param dialogRef
	 * @returns user decision
	 */
	private _listenForDialogEvents$(
		dialogRef: MatDialogRef<AuthDialogComponent, any>,
		type: 'inactive' | 'expired'
	): Observable<AuthDialogUserDecision> {
		this._log.trace('_listenForDialogEvents executed.', this);
		return race(dialogRef.componentInstance.staySignedInClicked, dialogRef.componentInstance.signOutClicked).pipe(
			tap(() => this._dialog.closeAll()),
			switchMap((decision: AuthDialogUserDecision) => this._handleUserDialogAction$(decision, type))
		) as Observable<AuthDialogUserDecision>;
	}

	/**
	 * Handles the action user took on the dialog.
	 * @param decision
	 * @returns any
	 */
	private _handleUserDialogAction$(decision: AuthDialogUserDecision, type: 'inactive' | 'expired'): Observable<any> {
		this._log.trace('_handleUserDialogAction$ executed.', this);
		if (decision === AuthDialogUserDecision.staySignedIn) {
			this._log.debug('[_handleUserDialogAction$] User chose to stay signed in.', this);
			return this._keepUserSignedIn$(type);
		} else {
			this._log.debug('[_handleUserDialogAction$] User chose to sign out.', this);
			return this.signUserOut$();
		}
	}

	/**
	 * Handles user's action to stay signed in.
	 * If dialog is for inactivity dismisses the dialog.
	 * If dialog is for expired session, request is made to attempt to renew access token.
	 * @param type
	 * @returns any
	 */
	private _keepUserSignedIn$(type: 'inactive' | 'expired'): Observable<any> {
		this._log.trace('_keepUserSignedIn$ executed.', this);
		if (type === 'expired') {
			this._log.debug("[_keepUserSignedIn$] Auth dialog type is 'expired'.", this);
			return this._tryRenewAccessToken$();
		} else {
			this._log.debug("[_keepUserSignedIn$] Auth dialog type is 'inactive'.", this);
			return of(true);
		}
	}

	/**
	 * Renewes expired session.
	 * @returns result of session renewal
	 */
	private _tryRenewSession$(): Observable<InitSessionResult> {
		this._log.trace('_tryRenewSession$ executed.', this);
		return this._authAsyncService.tryRenewAccessToken$().pipe(
			map((result) => {
				return {
					succeeded: result.succeeded,
					error: !result.succeeded,
					accessToken: result.accessToken
				} as InitSessionResult;
			})
		);
	}

	/**
	 * Ensures user is signed out, by signing them out of the application.
	 * @returns session signout result
	 */
	private _ensureUserIsSignedout$(): Observable<InitSessionResult> {
		this._log.trace('_ensureUserIsSignedout executed.', this);
		return this._store.dispatch(new Auth.Signout()).pipe(
			map(() => {
				return {
					succeeded: false,
					error: false
				} as InitSessionResult;
			})
		);
	}

	/**
	 * Sets initialize session result for authenticated user.
	 * @returns InitSessionResult
	 */
	private _setInitSessionResultForAuthenticatedUser$(): Observable<InitSessionResult> {
		this._log.trace('_signinAuthenticatedUser executed.', this);
		// Grab the access token.
		const accessToken: AccessToken = {
			access_token: this._store.selectSnapshot(AuthState.selectAccessToken),
			expires_in: this._store.selectSnapshot(AuthState.selectExpiresInSeconds)
		};

		// set the initialize session result.
		const result: InitSessionResult = {
			succeeded: true,
			error: false,
			accessToken
		};

		return of(result);
	}
}
