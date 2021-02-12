import { Injectable } from '@angular/core';
import { SignupUser } from 'app/core/auth/signup-user.model';
import { AuthAsyncService } from 'app/core/auth/auth-async.service';
import { Observable } from 'rxjs';
import { SigninUser } from 'app/core/auth/signin-user.model';
import { ProblemDetailsError } from 'app/core/error-handler/problem-details-error.decorator';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerError } from 'app/core/error-handler/internal-server-error.decorator';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { tap } from 'rxjs/operators';
import { Store, Select } from '@ngxs/store';
import * as Auth from '../../core/auth/auth.store.actions';
import { Router } from '@angular/router';
import { AccessToken } from 'app/core/auth/access-token.model';
import { AuthState } from 'app/core/auth/auth.store.state';
import { SocialAuthService, SocialUser, GoogleLoginProvider, FacebookLoginProvider } from 'angularx-social-login';
import { UsersAsyncService } from 'app/core/services/users-async.service';
import { PasswordReset } from 'app/core/auth/password-reset.model';
import { JsonWebTokenService } from 'app/core/services/json-web-token.service';
import { TranslateErrorsService } from 'app/shared/services/translate-errors.service';
import { LogService } from 'app/core/logger/log.service';
import { FormBuilder } from '@angular/forms';
import { ActiveAuthType } from 'app/core/auth/active-auth-type.model';
import { AuthTypeRouteUrl } from 'app/core/auth/auth-type-route-url.model';
import { NotificationService } from 'app/core/core.module';
import { AuthService } from './auth.service';

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
		private jwtService: JsonWebTokenService,
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
			.pipe(tap((access_token) => this._authenticate(access_token)))
			.subscribe();
	}

	/**
	 * Signs user in.
	 * @param model
	 */
	signinUser(model: SigninUser): void {
		this.authAsyncService
			.signin(model)
			.pipe(tap((access_token) => this._authenticate(access_token, model.rememberMe)))
			.subscribe();
	}

	/**
	 * Signs user in with google.
	 */
	signinUserWithGoogle(rememberMe: boolean): void {
		void this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID).then((model: SocialUser) => {
			this.authAsyncService
				.signinWithGoogle(model)
				.pipe(tap((token) => this._authenticate(token, rememberMe)))
				.subscribe();
		});
	}

	/**
	 * Signs user in with facebook.
	 */
	signinUserWithFacebook(rememberMe: boolean): void {
		void this.socialAuthService.signIn(FacebookLoginProvider.PROVIDER_ID).then((model: SocialUser) => {
			this.authAsyncService
				.signinWithFacebook(model)
				.pipe(tap((token) => this._authenticate(token, rememberMe)))
				.subscribe();
		});
	}

	/**
	 * Authenticates user that has signed in or signed up.
	 * @param token
	 * @param [rememberMe]
	 */
	private _authenticate(token: AccessToken, rememberMe?: boolean): void {
		this.authService.authenticate(token, rememberMe);
	}
}
