import { Injectable } from '@angular/core';
import { AuthAsyncService } from 'app/core/auth/auth-async.service';
import { tap, map, switchMap, takeUntil, take, catchError, startWith } from 'rxjs/operators';
import * as Auth from './auth.store.actions';
import { LogService } from 'app/core/logger/log.service';
import { Store, Actions, ofActionCompleted } from '@ngxs/store';
import { JsonWebTokenService } from 'app/core/auth/json-web-token.service';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material/dialog';
import { AuthDialogComponent } from '../../views/auth/auth-dialog/auth-dialog.component';
import { AuthState } from 'app/core/auth/auth.store.state';
import { Observable, of, timer, race } from 'rxjs';
import { AuthDialogUserDecision } from '../models/auth/auth-dialog-user-decision.enum';
import { fromUnixTime } from 'date-fns';
import { UserSessionActivityService } from '../user-session-activity/user-session-activity.service';
import { AuthDialogData } from '../models/auth/auth-dialog-data.model';
import { InitSessionResult } from '../models/auth/init-session-result.model';
import { RenewAccessTokenResult } from '../models/auth/renew-access-token-result.model';
import { AccessToken } from '../models/auth/access-token.model';
import { TranslateService } from '@ngx-translate/core';
import AppConfiguration from '../../../assets/app.config.json';

import { NotificationService } from '../core.module';

import { AppConfig } from '../models/app-config.model';

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
	private readonly _authDialogTimeout: number;

	/**
	 * Auth dialog configuration. Initialized in the constructor.
	 */
	private _authDialogConfig: MatDialogConfig;

	/**
	 * Auth dialog reference.
	 */
	private _dialogRef: MatDialogRef<AuthDialogComponent, any>;

	/**
	 * Creates an instance of auth service.
	 * @param _authAsyncService
	 * @param _userActivityService
	 * @param _store
	 * @param _actions$
	 * @param _jwtService
	 * @param _dialog
	 * @param _log
	 * @param _translationService
	 * @param _serverErrorService
	 * @param _notificationService
	 */
	constructor(
		private _authAsyncService: AuthAsyncService,
		private _userActivityService: UserSessionActivityService,
		private _store: Store,
		private _actions$: Actions,
		private _jwtService: JsonWebTokenService,
		private _dialog: MatDialog,
		private _log: LogService,
		private _translationService: TranslateService,
		private _notificationService: NotificationService
	) {
		const appConfig = AppConfiguration as AppConfig;
		const sessionConfig = appConfig.session;
		this._authDialogTimeout = sessionConfig.sessionExpiredDialogTimeout;

		this._authDialogConfig = {
			data: {
				dialogTimeout: this._authDialogTimeout
			} as AuthDialogData,
			closeOnNavigation: true,
			disableClose: true
		};
	}

	/**
	 * Proceeds with standard sign in flow.
	 * @param accessToken
	 * @param rememberMe
	 * @param email
	 * @param is2StepVerificationRequired
	 * @param provider
	 * @returns app signin authentication$
	 */
	processAppSigninAuthentication$(
		accessToken: AccessToken,
		rememberMe: boolean,
		email: string,
		is2StepVerificationRequired: boolean,
		provider: string
	): Observable<any> {
		this._log.trace('processAppSigninAuthentication$ executed.', this);

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
	 * @param accessToken
	 * @param email
	 * @param is2StepVerificationRequired
	 * @param provider
	 * @returns authentication$
	 */
	private _processAuthentication$(accessToken: AccessToken, email: string, is2StepVerificationRequired: boolean, provider: string): Observable<any> {
		this._log.trace('_processAuthentication$ executed.', this);
		if (is2StepVerificationRequired) {
			return this._requires2StepVerification$(provider, email);
		} else {
			return this._doesNotRequire2StepVerification$(accessToken);
		}
	}

	/**
	 * Dispatches action to indicate two step verification process is not required and that
	 * the user is signed in.
	 * @param accessToken
	 * @returns not require2 step verification$
	 */
	private _doesNotRequire2StepVerification$(accessToken: AccessToken): Observable<any> {
		this._log.trace('_doesNotRequire2StepVerification$ executed.', this);
		if (accessToken) {
			const userId = this._jwtService.getSubClaim(accessToken.access_token);
			return this._store
				.dispatch([
					// if no other errors occured, sign user in
					new Auth.Is2StepVerificationRequired({ is2StepVerificationRequired: false }),
					new Auth.Signin({ accessToken, userId })
				])
				.pipe(switchMap(() => this.monitorSessionActivity$()));
		} else {
			this._log.error('[_doesNotRequire2StepVerification$]: AccessToken was not defined. User authentication failed.', this);
		}
	}

	/**
	 * Dispatches actions to indicate two step verification process is required.
	 * @param provider
	 * @param email
	 * @returns step verification$
	 */
	private _requires2StepVerification$(provider: string, email: string): Observable<any> {
		this._log.trace('_requires2StepVerification$ executed.', this);
		if (provider) {
			return this._store.dispatch([
				new Auth.Is2StepVerificationRequired({ is2StepVerificationRequired: true }),
				new Auth.TwoStepVerificationData({ twoStepVerificationEmail: email, twoStepVerificationProvider: provider })
			]);
		} else {
			this._log.error('[_requires2StepVerification$]: Provider was not defined. Two step logging will fail.', this);
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
	 * Dispatches actions to Signs user out.
	 * @returns any
	 */
	signUserOut$(): Observable<any> {
		this._log.trace('signUserOut$ executed.', this);
		this._store.dispatch([new Auth.Signout(), new Auth.KeepOrRemoveRememberMeUsername()]);
		this._userActivityService.cleanUp();

		return this._authAsyncService.signout$();
	}

	/**
	 * DO NOT USE. Only for apps initializer user sign out.
	 * @returns initializer user sign out$
	 */
	appInitializerUserSignOut$(): Observable<any> {
		this._log.trace('appInitializerUserSignOut$ executed.', this);
		return this._authAsyncService.signout$().pipe(
			tap(() => {
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
		const expires_at_raw = this._store.selectSnapshot(AuthState.selectExpiresAtRaw);
		const expires_at_date = fromUnixTime(expires_at_raw);

		// isAuthenticatedFunc has to be a function otherwise isAuthenticated from the stored gets cached and we
		// get outdated value.
		if (isAuthenticatedFunc(new Date(), expires_at_date)) {
			this._log.verbose('[_manageUserSession$]: User is authenticated.', this);
			return this._handleAuthenticatedUserSession$(isActive);
		} else {
			this._log.verbose('[_manageUserSession$]: User is not authenticated.', this);
			return this._handleUnauthenticatedUserSession$(isActive);
		}
	}

	/**
	 * Handles authenticated user session and checks if user is active.
	 * @param isActive
	 * @returns any
	 */
	private _handleAuthenticatedUserSession$(isActive: boolean): Observable<any> {
		this._log.verbose('_handleAuthenticatedUserSession$ executed.', this);
		if (isActive === false) {
			this._log.verbose('[_handleAuthenticatedUserSession$] User is not active.');
			return this._handleSessionInactivity$();
		} else {
			this._log.verbose('[_handleAuthenticatedUserSession$] User is active.');
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
		return this._translationService.get('odm.auth.session.inactive').pipe(
			switchMap((message: string) => {
				this._log.trace('[_handleSessionInactivity$]: Auth dialog message translated. Proceeding to display dialog prompt.', this);
				(this._authDialogConfig.data as AuthDialogData).message = message;
				return this._promptDialog$('inactive');
			})
		);
	}

	/**
	 * Handles displaying dialog for user whose session has ended.
	 * @returns any
	 */
	private _handleSessionHasEnded$(): Observable<any> {
		this._log.trace('_handleSessionHasEnded$ executed.', this);
		return this._translationService.get('odm.auth.session.expired').pipe(
			switchMap((message: string) => {
				this._log.trace('[_handleSessionHasEnded$]: Auth dialog message translated. Proceeding to display dialog prompt.', this);
				(this._authDialogConfig.data as AuthDialogData).message = message;
				return this._promptDialog$('expired');
			})
		);
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
			}),
			catchError(() => {
				this._log.error('An error occured renewing user`s token. Signing out.', this);
				return this.signUserOut$().pipe(catchError(() => this._notifyErrorUserToastMessage$('odm.auth.session.failed-to-renew')));
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
		this._dialogRef = this._dialog.open(AuthDialogComponent, this._authDialogConfig);
		const userActions$ = this._listenForDialogEvents$(this._dialogRef, type);
		// Edge case with timer explained:
		// If auth dialog timeout has about 5 seconds left, and user takes an action for example to stay signed in,
		// and this request let's say takes 6 seconds. If this request fails, user will be signed out of the app via signUserOut$ method.
		// Since the request took 6 seconds, the rxjs 'timer' function would ALSO execute and signUserOut$ method in 'userTookNoActions$' stream
		// would be triggered.
		// Solution:
		// Once we know user an action (either stay signed in or sign out), don't wait for the server to respond
		// simply emit any value (startWith(true)) to indicate that some action was taken to terminate rxjs 'timer' function.
		const userTookNoActions$ = timer(this._authDialogTimeout * 1000).pipe(
			take(1),
			switchMap(() => {
				const allottedTime = (this._authDialogConfig.data as AuthDialogData).dialogTimeout;
				this._log.debug(
					'[_promptDialog$]: User took no action in allotted time. Closing dialog and signing user out. Allotted time:',
					this,
					allottedTime
				);
				return this.signUserOut$().pipe(
					switchMap(() => {
						this._log.trace('Closing auth dialog.', this);
						return this._closeDialogAndNotifyUser$('odm.auth.session.inactive-toast-message');
					}),
					catchError(() => {
						this._log.error('An error occured. Closing auth dialog.', this);
						return this._closeDialogAndNotifyUser$('odm.auth.session.inactive-toast-message');
					})
				);
			})
		);

		return race(userActions$, userTookNoActions$);
	}

	/**
	 * Closes auth dialog and notifies user via toast message about expired session.
	 * @param message
	 * @returns dialog and notify user$
	 */
	private _closeDialogAndNotifyUser$(message: string): Observable<any> {
		this._log.trace('_closeDialogAndNotifyUser$ fired.', this);
		this._dialogRef.close();
		return this._notifyInfoUserToastMessage$(message);
	}

	/**
	 * Translates user's inactive session message and displays toast notification.
	 * @returns about expired session$
	 */
	private _notifyInfoUserToastMessage$(message: string): Observable<any> {
		this._log.trace('_notifyAboutExpiredSession$ fired.', this);
		return this._translationService.get(message).pipe(
			tap((message: string) => {
				this._log.trace('[_notifyAboutExpiredSession$]: Message translated. Displaying info toast message.', this);
				this._notificationService.infoWithBtn(message);
			})
		);
	}

	/**
	 * Translates user's inactive session message and displays toast notification.
	 * @returns about expired session$
	 */
	private _notifyErrorUserToastMessage$(message: string): Observable<any> {
		this._log.trace('_notifyAboutExpiredSession$ fired.', this);
		return this._translationService.get(message).pipe(
			tap((message: string) => {
				this._log.trace('[_notifyAboutExpiredSession$]: Message translated. Displaying info toast message.', this);
				this._notificationService.errorWithBtn(message);
			})
		);
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
			switchMap((decision: AuthDialogUserDecision) =>
				this._handleUserDialogAction$(decision, type)
					// in order to avoid edge case when code reaches this point, it means user has taken action on the auth dialog
					// this means we need to terminate rxjs 'timer' started in '_promptDialog$'.
					.pipe(startWith(true))
			)
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
			this._log.debug('[_handleUserDialogAction$]: User chose to stay signed in.', this);
			return this._keepUserSignedIn$(type);
		} else {
			this._log.debug('[_handleUserDialogAction$]: User chose to sign out.', this);
			return this.signUserOut$().pipe(
				catchError(() => {
					this._log.error('[_handleUserDialogAction$]: Error occured signing user out. Sliently sign out.', this);
					return of();
				})
			);
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
