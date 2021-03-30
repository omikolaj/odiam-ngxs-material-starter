import { Injectable } from '@angular/core';
import { AuthAsyncService } from 'app/core/auth/auth-async.service';
import { tap, map, finalize, switchMap, takeUntil, filter } from 'rxjs/operators';
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
import { Observable, of, EMPTY, timer, race } from 'rxjs';
import { AuthDialogUserDecision } from '../../views/auth/auth-dialog/auth-dialog-user-decision.enum';
import { InitSessionResult } from 'app/core/auth/models/init-session-result.model';
import { fromUnixTime } from 'date-fns';
import { UserSessionActivityService } from '../services/user-session-activity.service';
import { RenewAccessTokenResult } from './models/renew-access-token-result.model';

/**
 * Auth service.
 */
/**
 * Injectable
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
	 * Whether the monitorUserSessionActivity should skip executing on interval. This gets changed to true when
	 * user's session is being actively worked on.
	 */
	private _skipInterval = false;

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
				timeUntilTimeoutSeconds: this._timeOutInMs / 1000
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
		this.log.trace('authenticate executed.', this);
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
		const isAuthenticatedFunc = this.store.selectSnapshot(AuthState.selectIsAuthenticatedFunc);
		return this.userActivityService.monitorUserSessionActivity$().pipe(
			takeUntil(this.actions$.pipe(ofActionCompleted(Auth.Signout))),
			filter(() => !this._skipInterval),
			switchMap((isActive) => this._manageUserSession$(isAuthenticatedFunc, isActive))
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
		const expires_at = this.store.selectSnapshot(AuthState.selectExpiresAtRaw);
		const expires_at_date = fromUnixTime(expires_at);

		// while we are managing user session, ensure to skip interval from emitting needlesly.
		this._skipInterval = true;

		// isAuthenticatedFunc has to be a function otherwise isAuthenticated from the stored gets cached and we
		// get outdated value.
		if (isAuthenticatedFunc(new Date(), expires_at_date)) {
			return this._handleAuthenticatedUserSession$(isActive).pipe(finalize(() => (this._skipInterval = false)));
		} else {
			return this._handleUnauthenticatedUserSession$(isActive).pipe(finalize(() => (this._skipInterval = false)));
		}
	}

	/**
	 * Handles authenticated user session and checks if user is active.
	 * @param isActive
	 * @returns authenticated user session
	 */
	private _handleAuthenticatedUserSession$(isActive: boolean): Observable<any> {
		if (isActive === false) {
			return this._handleSessionInactivity$();
		} else {
			return EMPTY;
		}
	}

	/**
	 * Handles unauthenticated user session and checks if user is active.
	 * @param isActive
	 * @returns unauthenticated user session
	 */
	private _handleUnauthenticatedUserSession$(isActive: boolean): Observable<any> {
		if (isActive === false) {
			return this._initiateSignout$();
		} else {
			return this._tryRenewAccessToken$();
		}
	}

	/**
	 * Handles displaying of dialog for user whose session has been inactive.
	 * @returns session inactivity
	 */
	private _handleSessionInactivity$(): Observable<any> {
		(this._authDialogConfig.data as AuthDialogData).message = 'You are about to be signed out due to inactivity.';
		return this._promptAuthDialog$();
	}

	/**
	 * Handles displaying of dialog for user whose session has ended.
	 * @returns session has ended
	 */
	private _handleSessionHasEnded$(): Observable<any> {
		(this._authDialogConfig.data as AuthDialogData).message = 'Your session is expired and you are about to be signed out.';
		return this._promptAuthDialog$();
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
	 * Renews expired session or sign user out depending on their configured options.
	 * @param isAuthenticated
	 * @param staySignedIn
	 * @param didExplicitlySignout
	 * @returns expired session or sign user out
	 */
	initUserSession(isAuthenticated: boolean, staySignedIn: boolean, didExplicitlySignout: boolean): Observable<InitSessionResult> {
		this.log.trace('initUserSession executed.', this);
		// If token is valid treat as a successful sign in
		if (isAuthenticated) {
			this.log.debug('initUserSession: User is authenticated. Signing user in.', this);
			return this._signinAuthenticatedUser();
		}
		// if staySignedIn is true and user did not explicitly sign out. Treat as renew current session.
		else if (staySignedIn === true && didExplicitlySignout === false) {
			this.log.debug('initUserSession: User is not authenticated and they did not explicitly sign out. Renewing session.', this);
			return this._renewSessionFromExpiredSession();
		}
		// else if user did not explicitly sign out, sign them out.
		else {
			this.log.debug('initUserSession: User is not authenticated and session is not set to stay signed in. Signing user out.', this);
			return of(didExplicitlySignout).pipe(switchMap(() => this._signOutUserFromApplication(didExplicitlySignout)));
		}
	}

	/**
	 * Trys renew access token$
	 * @returns renew access token$
	 */
	private _tryRenewAccessToken$(): Observable<any> {
		return this.authAsyncService.tryRenewAccessToken().pipe(switchMap((result) => this._proceedWithRenewalOfAccessTokenResult(result)));
	}

	/**
	 * Checks if access token renewal was successful or not and proceeds with it the result.
	 * @param result
	 * @returns with renewal of access token result
	 */
	private _proceedWithRenewalOfAccessTokenResult(result: RenewAccessTokenResult): Observable<any> {
		if (result.succeeded) {
			return this.authenticate$(result.accessToken);
		} else {
			return this.signUserOut$();
		}
	}

	/**
	 * Displays the auth dialog.
	 * @returns auth dialog$
	 */
	private _promptAuthDialog$(): Observable<any> {
		const dialogRef = this.dialog.open(AuthDialogComponent, this._authDialogConfig);
		const userActions$ = this._listenForDialogEvents$(dialogRef);
		const userTookNoActions$ = timer(this._timeOutInMs).pipe(
			switchMap(() => this.signUserOut$()),
			tap(() => this.dialog.closeAll())
		);

		return race(userActions$, userTookNoActions$).pipe(tap(() => (this._skipInterval = false)));
	}

	/**
	 * Initiates user signout procedure.
	 * @returns signout
	 */
	private _initiateSignout$(): Observable<any> {
		this.log.trace('_initiateSignout executed.', this);
		return this._handleSessionHasEnded$();
	}

	/**
	 * Listens for auth dialog events. User can either choose to stay signed in, sign out or take no action. Treated as signout.
	 * @param dialogRef
	 * @returns for dialog events
	 */
	private _listenForDialogEvents$(dialogRef: MatDialogRef<AuthDialogComponent, any>): Observable<AuthDialogUserDecision> {
		this.log.trace('_listenForDialogEvents executed.', this);
		return race(dialogRef.componentInstance.staySignedInClicked, dialogRef.componentInstance.signOutClicked).pipe(
			tap(() => this.dialog.closeAll()),
			switchMap((decision: AuthDialogUserDecision) => this._handleUserAction(decision))
		) as Observable<AuthDialogUserDecision>;
	}

	/**
	 * Handles the action user took on the dialog.
	 * @param decision
	 * @returns took action
	 */
	private _handleUserAction(decision: AuthDialogUserDecision): Observable<any> {
		if (decision === AuthDialogUserDecision.staySignedIn) {
			return this._tryRenewAccessToken$();
		} else {
			return this.signUserOut$();
		}
	}
	/**
	 * Signs user out of the application.
	 */
	private _signOut$(): Observable<void> {
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
			return this._signOut$().pipe(map(() => initSessionResult));
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
			tap(() => this.log.trace('_signinAuthenticatedUser: Dispatched Auth.Signin.', this)),
			map(() => result)
		);
	}
}
