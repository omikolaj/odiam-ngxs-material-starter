import { Injectable } from '@angular/core';
import { AuthAsyncService } from 'app/core/auth/auth-async.service';
import { tap, map, finalize, switchMap, takeUntil, take } from 'rxjs/operators';
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
import { Observable, of, timer, race } from 'rxjs';
import { AuthDialogUserDecision } from '../../views/auth/auth-dialog/auth-dialog-user-decision.enum';
import { InitSessionResult } from 'app/core/auth/models/init-session-result.model';
import { fromUnixTime } from 'date-fns';
import { UserSessionActivityService } from '../user-session-activity/user-session-activity.service';
import { RenewAccessTokenResult } from './models/renew-access-token-result.model';

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
	private _authDialogTimeoutInMs = 10000;

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
		private actions$: Actions,
		private userActivityService: UserSessionActivityService
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
	 * Authenticates user with the app by signing them in.
	 * @param accessToken
	 * @returns authenticate$
	 */
	authenticate$(accessToken: AccessToken): Observable<any> {
		this.log.trace('authenticate$ executed.', this);
		const userId = this.jwtService.getSubClaim(accessToken.access_token);
		return this.store.dispatch(new Auth.Signin({ accessToken, userId }));
	}

	/**
	 * Monitors user's session activity.
	 * @param isAuthenticatedFunc
	 * @param expires_at
	 * @returns session activity$
	 */
	monitorUserSessionActivity$(): Observable<any> {
		this.log.trace('monitorUserSessionActivity$ executed.', this);
		const isAuthenticatedFunc = this.store.selectSnapshot(AuthState.selectIsAuthenticatedFunc);
		return this.userActivityService.monitorUserSessionActivity$().pipe(
			takeUntil(this.actions$.pipe(ofActionCompleted(Auth.Signout))),
			tap(() => this.userActivityService.stopActivityTimer()),
			switchMap((isActive) => this._manageUserSession$(isAuthenticatedFunc, isActive)),
			tap(() => this.userActivityService.startActivityTimer())
		);
	}

	/**
	 * Renews expired session or sign user out depending on their configured options.
	 * @param isAuthenticated
	 * @param staySignedIn
	 * @param didExplicitlySignout
	 * @returns expired session or sign user out
	 */
	initUserSession$(isAuthenticated: boolean, didExplicitlySignout: boolean): Observable<InitSessionResult> {
		this.log.trace('initUserSession executed.', this);
		// If user is authenticated, treat it as a signin.
		if (isAuthenticated) {
			this.log.debug('initUserSession$: User is authenticated.', this);
			return this._getAuthenticatedUserToken$();
		}
		// If user is not authenticated and user did NOT explicitly sign out, try to renew their session.
		if (didExplicitlySignout === false) {
			this.log.debug('initUserSession$: User is not authenticated and did not explicitly sign out. Attempting to renewing session.', this);
			return this._renewSessionFromExpiredSession$();
		}
		// else if user did not explicitly sign out, sign them out.
		else {
			this.log.debug('initUserSession$: User is not authenticated and user explicitly signed out. Ensuring user is signed out.', this);
			return this._ensureUserIsSignedout$();
		}
	}

	/**
	 * Signs user out.
	 * @returns out user$
	 */
	signUserOut$(): Observable<any> {
		this.log.trace('signUserOut$ executed.', this);
		return this._signOut$().pipe(
			tap(() => void this.router.navigate(['auth/sign-in'])),
			finalize(() => this.userActivityService.cleanUp())
		);
	}

	/**
	 * Manages user session.
	 * @param isAuthenticatedFunc
	 * @param expires_at
	 * @param isActive
	 * @returns user session$
	 */
	private _manageUserSession$(isAuthenticatedFunc: (date: Date, expires_at: Date) => boolean, isActive: boolean): Observable<any> {
		this.log.trace('_manageUserSession$ executed.', this);
		const expires_at = this.store.selectSnapshot(AuthState.selectExpiresAtRaw);
		const expires_at_date = fromUnixTime(expires_at);

		// isAuthenticatedFunc has to be a function otherwise isAuthenticated from the stored gets cached and we
		// get outdated value.
		if (isAuthenticatedFunc(new Date(), expires_at_date)) {
			this.log.debug('[_manageUserSession$]: User is authenticated.', this);
			return this._handleAuthenticatedUserSession$(isActive);
		} else {
			this.log.debug('[_manageUserSession$]: User is not authenticated.', this);
			return this._handleUnauthenticatedUserSession$(isActive);
		}
	}

	/**
	 * Handles authenticated user session and checks if user is active.
	 * @param isActive
	 * @returns authenticated user session
	 */
	private _handleAuthenticatedUserSession$(isActive: boolean): Observable<any> {
		this.log.trace('_handleAuthenticatedUserSession$ executed.', this);
		if (isActive === false) {
			this.log.debug('[_handleAuthenticatedUserSession$] User is not active.');
			return this._handleSessionInactivity$();
		} else {
			this.log.debug('[_handleAuthenticatedUserSession$] User is active.');
			return of(true);
		}
	}

	/**
	 * Handles unauthenticated user session and checks if user is active.
	 * @param isActive
	 * @returns unauthenticated user session
	 */
	private _handleUnauthenticatedUserSession$(isActive: boolean): Observable<any> {
		this.log.trace('_handleUnauthenticatedUserSession$ executed.', this);
		if (isActive === false) {
			this.log.debug('[_handleUnauthenticatedUserSession$] User is not active.', this);
			return this._handleSessionHasEnded$();
		} else {
			this.log.debug('[_handleUnauthenticatedUserSession$] User is active.', this);
			return this._tryRenewAccessToken$();
		}
	}

	/**
	 * Handles displaying of dialog for user whose session has been inactive.
	 * @returns session inactivity
	 */
	private _handleSessionInactivity$(): Observable<any> {
		this.log.trace('_handleSessionInactivity$ executed.', this);
		(this._authDialogConfig.data as AuthDialogData).message = 'You are about to be signed out due to inactivity.';
		return this._promptAuthDialog$('inactive');
	}

	/**
	 * Handles displaying of dialog for user whose session has ended.
	 * @returns session has ended
	 */
	private _handleSessionHasEnded$(): Observable<any> {
		this.log.trace('_handleSessionHasEnded$ executed.', this);
		(this._authDialogConfig.data as AuthDialogData).message = 'Your session is expired and you are about to be signed out.';
		return this._promptAuthDialog$('expired');
	}

	/**
	 * Trys renew access token$
	 * @returns renew access token$
	 */
	private _tryRenewAccessToken$(): Observable<any> {
		this.log.trace('_tryRenewAccessToken$ executed.', this);
		return this.authAsyncService.tryRenewAccessToken().pipe(
			switchMap((result) => {
				this.log.debug('[_tryRenewAccessToken$]: succeeded:', this, result.succeeded);
				return this._proceedWithRenewalOfAccessTokenResult$(result);
			})
		);
	}

	/**
	 * Checks if access token renewal was successful or not and proceeds with it the result.
	 * @param result
	 * @returns with renewal of access token result
	 */
	private _proceedWithRenewalOfAccessTokenResult$(result: RenewAccessTokenResult): Observable<any> {
		this.log.trace('_proceedWithRenewalOfAccessTokenResult$ executed.');
		if (result.succeeded) {
			this.log.debug('[_proceedWithRenewalOfAccessTokenResult$] result succeeded.', this);
			return this.authenticate$(result.accessToken);
		} else {
			this.log.debug('[_proceedWithRenewalOfAccessTokenResult$] result failed.', this);
			return this.signUserOut$();
		}
	}

	/**
	 * Displays the auth dialog.
	 * @returns auth dialog$
	 */
	private _promptAuthDialog$(type: 'inactive' | 'expired'): Observable<any> {
		this.log.trace('_promptAuthDialog$ executed.', this);
		const dialogRef = this.dialog.open(AuthDialogComponent, this._authDialogConfig);
		const userActions$ = this._listenForDialogEvents$(dialogRef, type);
		const userTookNoActions$ = timer(this._authDialogTimeoutInMs).pipe(
			take(1),
			switchMap(() => this.signUserOut$()),
			tap(() => this.dialog.closeAll())
		);

		return race(userActions$, userTookNoActions$);
	}

	/**
	 * Listens for auth dialog events. User can either choose to stay signed in, sign out or take no action. Treated as signout.
	 * @param dialogRef
	 * @returns for dialog events
	 */
	private _listenForDialogEvents$(
		dialogRef: MatDialogRef<AuthDialogComponent, any>,
		type: 'inactive' | 'expired'
	): Observable<AuthDialogUserDecision> {
		this.log.trace('_listenForDialogEvents executed.', this);
		return race(dialogRef.componentInstance.staySignedInClicked, dialogRef.componentInstance.signOutClicked).pipe(
			tap(() => this.dialog.closeAll()),
			switchMap((decision: AuthDialogUserDecision) => this._handleUserAction$(decision, type))
		) as Observable<AuthDialogUserDecision>;
	}

	/**
	 * Handles the action user took on the dialog.
	 * @param decision
	 * @returns took action
	 */
	private _handleUserAction$(decision: AuthDialogUserDecision, type: 'inactive' | 'expired'): Observable<any> {
		this.log.trace('_handleUserAction$ executed.', this);
		if (decision === AuthDialogUserDecision.staySignedIn) {
			this.log.debug('[_handleUserAction$] User chose to stay signed in.', this);
			return this._onStaySignedIn$(type);
		} else {
			this.log.debug('[_handleUserAction$] User chose to sign out.', this);
			return this.signUserOut$();
		}
	}

	/**
	 * Handles user's action based on dialog type when they decide to stay signed in.
	 * @param type
	 * @returns stay signed in
	 */
	private _onStaySignedIn$(type: 'inactive' | 'expired'): Observable<any> {
		this.log.trace('_onStaySignedIn$ executed.', this);
		if (type === 'expired') {
			this.log.debug("[_onStaySignedIn$] Auth dialog type is 'expired'.", this);
			return this._tryRenewAccessToken$();
		} else {
			this.log.debug("[_onStaySignedIn$] Auth dialog type is 'inactive'.", this);
			return of(true);
		}
	}
	/**
	 * Signs user out of the application.
	 */
	private _signOut$(): Observable<void> {
		this.log.trace('signOut: Signing user out from the server and from application. Dispatching KeepOrRemoveRememberMeUsername.', this);
		return this.authAsyncService.signout().pipe(finalize(() => this.store.dispatch([new Auth.Signout(), new Auth.KeepOrRemoveRememberMeUsername()])));
	}

	/**
	 * Initializes new session for expired session.
	 * @returns session for expired session
	 */
	private _renewSessionFromExpiredSession$(): Observable<InitSessionResult> {
		this.log.trace('_renewSessionFromExpiredSession$ executed.', this);
		return this.authAsyncService.tryRenewAccessToken().pipe(
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
	 * Signs user out. Only executed when certain conditions are met when the application first initializes.
	 * @returns out on init session
	 */
	private _ensureUserIsSignedout$(): Observable<InitSessionResult> {
		this.log.trace('_ensureUserIsSignedout executed.', this);
		return this.store.dispatch(new Auth.Signout()).pipe(
			map(() => {
				return {
					succeeded: false,
					error: false
				} as InitSessionResult;
			})
		);
	}

	/**
	 * Grabs authenticated user's access token and sets InitSessionResult.
	 * @returns InitSessionResult
	 */
	private _getAuthenticatedUserToken$(): Observable<InitSessionResult> {
		this.log.trace('_signinAuthenticatedUser executed.', this);
		// Grab the access token.
		const accessToken: AccessToken = {
			access_token: this.store.selectSnapshot(AuthState.selectAccessToken),
			expires_in: this.store.selectSnapshot(AuthState.selectExpiresInSeconds)
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
