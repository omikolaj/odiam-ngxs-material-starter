import { Injectable } from '@angular/core';
import { SignupUser } from 'app/core/auth/models/signup-user.model';
import { AuthAsyncService } from 'app/core/auth/auth-async.service';
import { Observable } from 'rxjs';
import { SigninUser } from 'app/core/auth/models/signin-user.model';
import { ProblemDetailsError } from 'app/core/error-handler/problem-details-error.decorator';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerError } from 'app/core/error-handler/internal-server-error.decorator';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { switchMap, tap } from 'rxjs/operators';
import { Store, Select } from '@ngxs/store';
import * as Auth from '../../core/auth/auth.store.actions';
import { Router } from '@angular/router';
import { AccessToken } from 'app/core/auth/models/access-token.model';
import { AuthState } from 'app/core/auth/auth.store.state';
import { SocialAuthService, SocialUser, GoogleLoginProvider, FacebookLoginProvider } from 'angularx-social-login';
import { UsersAsyncService } from 'app/core/services/users-async.service';
import { PasswordReset } from 'app/core/auth/models/password-reset.model';
import { TranslateValidationErrorsService } from 'app/shared/services/translate-validation-errors.service';
import { LogService } from 'app/core/logger/log.service';
import { FormBuilder } from '@angular/forms';
import { ActiveAuthType } from 'app/core/auth/models/active-auth-type.model';
import { AuthTypeRouteUrl } from 'app/core/auth/models/auth-type-route-url.model';

import { AuthService } from '../../core/auth/auth.service';
import { TwoFactorAuthenticationVerificationCode } from '../account/security-container/two-factor-authentication/models/two-factor-authentication-verification-code.model';
import { TwoFactorRecoveryCode } from 'app/core/auth/models/two-factor-recovery-code.model';

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
	 * Whether two step verification process was successful.
	 */
	@Select(AuthState.selectIs2StepVerificationSuccessful) is2StepVerificationSuccessful$: Observable<boolean>;

	/**
	 * Whether redemption of recovery code was successful.
	 */
	@Select(AuthState.selectIsRedeemRecoveryCodeSuccessful) isRecoveryCodeRedemptionSuccessful$: Observable<boolean>;

	/**
	 * Creates an instance of auth facade service.
	 * @param authAsyncService
	 * @param notification
	 * @param store
	 * @param router
	 */
	constructor(
		public translateValidationErrorService: TranslateValidationErrorsService,
		public log: LogService,
		public fb: FormBuilder,
		public router: Router,
		private authAsyncService: AuthAsyncService,
		private usersAsyncService: UsersAsyncService,
		private store: Store,
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
		this.store.dispatch(new Auth.RememberMeOptionChange({ rememberMe: event }));
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
		this.usersAsyncService.forgotPassword$(email).subscribe();
	}

	/**
	 * Resets user password.
	 * @param model
	 */
	onResetPassword(model: PasswordReset): void {
		this.usersAsyncService.resetPassword$(model).subscribe();
	}

	/**
	 * Signs user up.
	 * @param model
	 */
	signupUser(model: SignupUser): void {
		this.authAsyncService
			.signup$(model)
			.pipe(
				switchMap((token) => this._authenticate$(token)),
				switchMap(() => this._monitorUserSession$())
			)
			.subscribe();
	}

	/**
	 * Signs user in.
	 * @param model
	 */
	signinUser(model: SigninUser): void {
		this.authAsyncService
			.signin$(model)
			.pipe(
				switchMap((resp) => this._authenticate$(resp.accessToken, model.rememberMe, model.email, resp.is2StepVerificationRequired, resp.provider))
			)
			.subscribe();
	}

	/**
	 * Verifys two step verification code
	 * @param model
	 */
	verifyTwoStepVerificationCode(model: TwoFactorAuthenticationVerificationCode): void {
		this.authAsyncService
			.verifyTwoStepVerificationCode$(model)
			.pipe(
				tap(() => this.store.dispatch(new Auth.Is2StepVerificationSuccessful({ is2StepVerificationSuccessful: true }))),
				switchMap((accessToken) => this._authenticate$(accessToken))
			)
			.subscribe();
	}

	/**
	 * Verifys two step verification code
	 * @param model
	 */
	cancelTwoStepVerificationCodeProcess(): void {
		void this.router.navigate(['auth/sign-in']);
	}

	/**
	 * Redeems users backup code and signs them in.
	 * @param model
	 */
	redeemRecoveryCode(model: TwoFactorRecoveryCode): void {
		this.authAsyncService
			.redeemRecoveryCode$(model)
			.pipe(
				tap(() => this.store.dispatch(new Auth.IsRedeemRecoveryCodeSuccessful({ isRedeemRecoveryCodeSuccessful: true }))),
				switchMap((accessToken) => this._authenticate$(accessToken))
			)
			.subscribe();
	}

	/**
	 * Signs user in with google.
	 */
	signinUserWithGoogle(): void {
		void this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID).then((model: SocialUser) => {
			this.authAsyncService
				.signinWithGoogle$(model)
				.pipe(
					switchMap((token) => this._authenticate$(token)),
					switchMap(() => this._monitorUserSession$())
				)
				.subscribe();
		});
	}

	/**
	 * Signs user in with facebook.
	 */
	signinUserWithFacebook(): void {
		void this.socialAuthService.signIn(FacebookLoginProvider.PROVIDER_ID).then((model: SocialUser) => {
			this.authAsyncService
				.signinWithFacebook$(model)
				.pipe(
					switchMap((token) => this._authenticate$(token)),
					switchMap(() => this._monitorUserSession$())
				)
				.subscribe();
		});
	}

	/**
	 * Authenticates user and takes them to the account page.
	 * @param [accessToken]
	 * @param [rememberMe]
	 * @param [email]
	 * @param [is2StepVerificationRequired]
	 * @param [provider]
	 * @returns Observable<any>
	 */
	private _authenticate$(
		accessToken?: AccessToken,
		rememberMe?: boolean,
		email?: string,
		is2StepVerificationRequired?: boolean,
		provider?: string
	): Observable<any> {
		return this.authService.processUserAuthentication$(accessToken, rememberMe, email, is2StepVerificationRequired, provider);
	}

	/**
	 * Monitors user session and keeps track if they are active.
	 * @returns Observable<any>
	 */
	private _monitorUserSession$(): Observable<any> {
		return this.authService.monitorSessionActivity$();
	}
}
