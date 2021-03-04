import { Injectable } from '@angular/core';
import { SignupUser } from 'app/core/auth/models/signup-user.model';
import { AuthAsyncService } from 'app/core/auth/auth-async.service';
import { Observable } from 'rxjs';
import { SigninUser } from 'app/core/auth/models/signin-user.model';
import { ProblemDetailsError } from 'app/core/error-handler/problem-details-error.decorator';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerError } from 'app/core/error-handler/internal-server-error.decorator';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { tap, filter } from 'rxjs/operators';
import { Store, Select } from '@ngxs/store';
import * as Auth from '../../core/auth/auth.store.actions';
import { Router } from '@angular/router';
import { AccessToken } from 'app/core/auth/models/access-token.model';
import { AuthState } from 'app/core/auth/auth.store.state';
import { SocialAuthService, SocialUser, GoogleLoginProvider, FacebookLoginProvider } from 'angularx-social-login';
import { UsersAsyncService } from 'app/core/services/users-async.service';
import { PasswordReset } from 'app/core/auth/models/password-reset.model';
import { TranslateErrorsService } from 'app/shared/services/translate-errors.service';
import { LogService } from 'app/core/logger/log.service';
import { FormBuilder } from '@angular/forms';
import { ActiveAuthType } from 'app/core/auth/models/active-auth-type.model';
import { AuthTypeRouteUrl } from 'app/core/auth/models/auth-type-route-url.model';
import { NotificationService } from 'app/core/core.module';
import { AuthService } from '../../core/auth/auth.service';

/**
 * Auth facade service.
 */
@Injectable()
export class AuthFacadeService {
	/**
	 * Emitted when server responds with 40X error.
	 */
	@ProblemDetailsError() problemDetails$: Observable<ProblemDetails>;

	/**
	 * Emitted when server responds with 50X error.
	 */
	@InternalServerError() internalServerErrorDetails$: Observable<InternalServerErrorDetails>;

	/**
	 * Whether rememberMe option is checked.
	 */
	@Select(AuthState.selectRememberMe) rememberMe$: Observable<boolean>;

	/**
	 * Username saved in local storage.
	 */
	@Select(AuthState.selectUsername) username$: Observable<string>;

	/**
	 * Whether stay signed in option is checked.
	 */
	@Select(AuthState.selectStaySignedIn) staySignedIn$: Observable<string>;

	/**
	 * Selects active auth type. Either sign-in/sign-up or forgot-password.
	 */
	@Select(AuthState.selectActiveAuthType) activeAuthType$: Observable<ActiveAuthType>;

	/**
	 * Creates an instance of auth facade service.
	 * @param authAsyncService
	 * @param notification
	 * @param store
	 * @param router
	 */
	constructor(
		public translateError: TranslateErrorsService,
		public log: LogService,
		public fb: FormBuilder,
		public router: Router,
		private authAsyncService: AuthAsyncService,
		private usersAsyncService: UsersAsyncService,
		private store: Store,
		private notification: NotificationService,
		private socialAuthService: SocialAuthService,
		private authService: AuthService
	) {}

	/**
	 * Whether user wants is navigating to sign-in or sign-up.
	 * @param activePanel
	 */
	onSwitchAuth(activePanel: { activeAuthType: ActiveAuthType }, routeUrl: AuthTypeRouteUrl): void {
		this.onUpdateActiveAuthType(activePanel);
		setTimeout(() => {
			void this.router.navigate(['/auth', routeUrl]);
		}, 600);
	}

	/**
	 * Updates active auth type for sign-in/sign-up/forgot-password.
	 * @param activePanel
	 */
	onUpdateActiveAuthType(activePanel: { activeAuthType: ActiveAuthType }): void {
		this.store.dispatch(new Auth.SwitchAuthType(activePanel));
	}

	/**
	 * Changes remember me state.
	 * @param event
	 */
	onRememberMeChanged(event: boolean): void {
		this.store.dispatch(new Auth.RememberMeOptionChange(event));
	}

	/**
	 * Changes stay signed in state.
	 * @param event
	 */
	onStaySignedinChanged(event: boolean): void {
		this.store.dispatch(new Auth.StaySignedinOptionChange(event));
	}

	/**
	 * Sends reset password link to the passed in email.
	 * @param email
	 */
	forgotPassword(email: string): void {
		this.usersAsyncService.forgotPassword(email).subscribe();
	}

	/**
	 * Resets user password.
	 * @param model
	 */
	onResetPassword(model: PasswordReset): void {
		this.usersAsyncService.resetPassword(model).subscribe();
	}

	/**
	 * Signs user up.
	 * @param model
	 */
	signupUser(model: SignupUser): void {
		this.authAsyncService
			.signup(model)
			.pipe(
				tap((token) => {
					this._authenticate(token);
					void this.router.navigate(['account']);
				})
			)
			.subscribe();
	}

	/**
	 * Signs user in.
	 * @param model
	 */
	signinUser(model: SigninUser): void {
		this.authAsyncService
			.signin(model)
			.pipe(
				tap((token) => {
					this._authenticate(token, model.staySignedIn);
					void this.router.navigate(['account']);
				}),
				filter(() => model.rememberMe),
				tap(() => this.store.dispatch(new Auth.UpdateRememberMeUsername(model.email)))
			)
			.subscribe();
	}

	/**
	 * Signs user in with google.
	 */
	signinUserWithGoogle(staySignedIn: boolean): void {
		void this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID).then((model: SocialUser) => {
			this.authAsyncService
				.signinWithGoogle(model)
				.pipe(
					tap((token) => {
						this._authenticate(token, staySignedIn);
						void this.router.navigate(['account']);
					})
				)
				.subscribe();
		});
	}

	/**
	 * Signs user in with facebook.
	 */
	signinUserWithFacebook(staySignedIn: boolean): void {
		void this.socialAuthService.signIn(FacebookLoginProvider.PROVIDER_ID).then((model: SocialUser) => {
			this.authAsyncService
				.signinWithFacebook(model)
				.pipe(
					tap((token) => {
						this._authenticate(token, staySignedIn);
						void this.router.navigate(['account']);
					})
				)
				.subscribe();
		});
	}

	/**
	 * Authenticates user that has signed in or signed up.
	 * @param token
	 * @param [staySignedIn]
	 */
	private _authenticate(token: AccessToken, staySignedIn?: boolean): void {
		return this.authService.authenticate(token, staySignedIn);
	}
}
