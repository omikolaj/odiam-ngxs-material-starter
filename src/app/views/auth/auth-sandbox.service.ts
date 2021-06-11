import { Injectable } from '@angular/core';
import { AuthAsyncService } from 'app/core/auth/auth-async.service';
import { Observable } from 'rxjs';
import { ProblemDetailsError } from 'app/core/error-handler/problem-details-error.decorator';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerError } from 'app/core/error-handler/internal-server-error.decorator';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { switchMap, tap } from 'rxjs/operators';
import { Store, Select, Actions, ofActionCompleted } from '@ngxs/store';
import * as Auth from '../../core/auth/auth.store.actions';
import { Router } from '@angular/router';
import { AuthState } from 'app/core/auth/auth.store.state';
import { SocialAuthService, SocialUser, GoogleLoginProvider, FacebookLoginProvider } from 'angularx-social-login';
import { UsersAsyncService } from 'app/shared/services/users-async.service';
import { TranslateValidationErrorsService } from 'app/shared/services/translate-validation-errors.service';
import { LogService } from 'app/core/logger/log.service';
import { FormBuilder } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { ActiveAuthType } from 'app/core/models/auth/active-auth-type.model';
import { AuthTypeRouteUrl } from 'app/core/models/auth/auth-type-route-url.model';
import { PasswordReset } from 'app/core/models/auth/password-reset.model';
import { TwoFactorAuthenticationVerificationCode } from 'app/core/models/account/security/two-factor-authentication-verification-code.model';
import { TwoFactorRecoveryCode } from 'app/core/models/auth/two-factor-recovery-code.model';
import { AccessToken } from 'app/core/models/auth/access-token.model';
import { SignupUser } from 'app/core/models/auth/signup-user.model';
import { SigninUser } from 'app/core/models/auth/signin-user.model';
import { AsyncValidatorsService } from 'app/core/form-validators/validators-async.service';
import { ChangeEmail } from 'app/core/models/auth/change-email.model';
import { ConfirmEmail } from 'app/core/models/auth/confirm-email.model';

/**
 * Auth sandbox service.
 */
@Injectable()
export class AuthSandboxService {
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
	 * Whether user's password reset request completed successfully.
	 */
	@Select(AuthState.selectPasswordResetCompleted) passwordResetCompleted$: Observable<boolean>;

	/**
	 * Whether user's registration completed successfully.
	 */
	@Select(AuthState.selectRegistrationCompleted) registrationCompleted$: Observable<boolean>;

	/**
	 * Whether there is an outgoing request to validate user's change email token and update it.
	 */
	@Select(AuthState.selectChangeEmailConfirmationInProgress) changeEmailConfirmationInProgress$: Observable<boolean>;

	/**
	 * Whether there is an outgoing request to confirm user's email address.
	 */
	@Select(AuthState.selectEmailConfirmationInProgress) emailConfirmationInProgress$: Observable<boolean>;

	/**
	 * Whether Auth.Signin action has been dispatched and completed.
	 */
	signInActionCompleted$ = this._actions$.pipe(ofActionCompleted(Auth.Signin));

	/**
	 * Creates an instance of auth sandbox service.
	 * @param translateValidationErrorService
	 * @param log
	 * @param fb
	 * @param router
	 * @param _authAsyncService
	 * @param _usersAsyncService
	 * @param _store
	 * @param _socialAuthService
	 * @param _authService,
	 * @param _actions$
	 */
	constructor(
		private _authAsyncService: AuthAsyncService,
		private _usersAsyncService: UsersAsyncService,
		private _store: Store,
		private _socialAuthService: SocialAuthService,
		private _authService: AuthService,
		private _actions$: Actions,
		public translateValidationErrorService: TranslateValidationErrorsService,
		public log: LogService,
		public fb: FormBuilder,
		public router: Router,
		public asyncValidators: AsyncValidatorsService
	) {}

	/**
	 * Whether user wants is navigating to sign-in or sign-up.
	 * @param activePanel
	 */
	switchActiveAuthType(activePanel: { activeAuthType: ActiveAuthType }, routeUrl: AuthTypeRouteUrl): void {
		this.updateActiveAuthType(activePanel);
		setTimeout(() => {
			void this.router.navigate(['/auth', routeUrl]);
		}, 300);
	}

	/**
	 * Updates active auth type for sign-in/sign-up/forgot-password.
	 * @param activePanel
	 */
	updateActiveAuthType(activePanel: { activeAuthType: ActiveAuthType }): void {
		this._store.dispatch(new Auth.SwitchAuthType(activePanel));
	}

	/**
	 * Changes remember me state.
	 * @param event
	 */
	changeRememberMeState(event: boolean): void {
		this._store.dispatch(new Auth.RememberMeOptionChange({ rememberMe: event }));
	}

	/**
	 * Sends reset password link to the passed in email.
	 * @param email
	 */
	forgotPassword(email: string): void {
		this._usersAsyncService.forgotPassword$(email).subscribe();
	}

	/**
	 * Resets user password.
	 * @param model
	 */
	resetPassword(id: string, model: PasswordReset): void {
		this._usersAsyncService
			.resetPassword$(id, model)
			.pipe(tap(() => this.resetPasswordCompleted(true)))
			.subscribe();
	}

	/**
	 * Dispatches an action to store indicate whether reset password request completed.
	 * @param value
	 */
	resetPasswordCompleted(value: boolean): void {
		this._store.dispatch(new Auth.PasswordResetCompleted({ passwordResetCompleted: value }));
	}

	/**
	 * Signs user up.
	 * @param model
	 */
	signupUser(model: SignupUser): void {
		this._authAsyncService
			.signup$(model)
			.pipe(tap(() => this.userRegistrationCompleted({ registrationCompleted: true })))
			.subscribe();
	}

	/**
	 * Signs user in.
	 * @param model
	 */
	signinUser(model: SigninUser): void {
		this._authAsyncService
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
		this._authAsyncService
			.verifyTwoStepVerificationCode$(model)
			.pipe(
				tap(() => this._store.dispatch(new Auth.Is2StepVerificationSuccessful({ is2StepVerificationSuccessful: true }))),
				switchMap((accessToken) => this._authenticate$(accessToken))
			)
			.subscribe();
	}

	/**
	 * Cancels two step verification process.
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
		this._authAsyncService
			.redeemRecoveryCode$(model)
			.pipe(
				tap(() => this._store.dispatch(new Auth.IsRedeemRecoveryCodeSuccessful({ isRedeemRecoveryCodeSuccessful: true }))),
				switchMap((accessToken) => this._authenticate$(accessToken))
			)
			.subscribe();
	}

	/**
	 * Signs user in with google.
	 */
	signinUserWithGoogle(): void {
		void this._socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID).then((model: SocialUser) => {
			this._authAsyncService
				.signinWithGoogle$(model)
				.pipe(switchMap((token) => this._authenticate$(token)))
				.subscribe();
		});
	}

	/**
	 * Signs user in with facebook.
	 */
	signinUserWithFacebook(): void {
		void this._socialAuthService.signIn(FacebookLoginProvider.PROVIDER_ID).then((model: SocialUser) => {
			this._authAsyncService
				.signinWithFacebook$(model)
				.pipe(switchMap((token) => this._authenticate$(token)))
				.subscribe();
		});
	}

	/**
	 * Dispatches action to the store whether user's registration completed without errors.
	 * @param value
	 */
	userRegistrationCompleted(value: { registrationCompleted: boolean }): void {
		this._store.dispatch(new Auth.RegistrationCompleted(value));
	}

	/**
	 * Confirms user's change email token and updates the email.
	 * @param id
	 * @param model
	 */
	confirmEmailChangeRequest(id: string, model: ChangeEmail): void {
		this.changeEmailConfirmationInProgress({ changeEmailConfirmationInProgress: true });
		this._usersAsyncService
			.changeEmail$(id, model)
			.pipe(tap(() => this._store.dispatch(new Auth.ChangeEmailConfirmationInProgress({ changeEmailConfirmationInProgress: false }))))
			.subscribe();
	}

	/**
	 * Dispatches whether change email confirmation is in progress.
	 * @param value
	 */
	changeEmailConfirmationInProgress(value: { changeEmailConfirmationInProgress: boolean }): void {
		this._store.dispatch(new Auth.ChangeEmailConfirmationInProgress(value));
	}

	/**
	 * Confirms user's email address.
	 * @param model
	 */
	confirmEmail(model: ConfirmEmail): void {
		this.emailConfirmationInProgress({ emailConfirmationInProgress: true });
		this._usersAsyncService
			.confirmEmail$(model)
			.pipe(tap(() => this.emailConfirmationInProgress({ emailConfirmationInProgress: false })))
			.subscribe();
	}

	/**
	 * Dispatches an action to the store whether email confirmation is in progress.
	 * @param value
	 */
	emailConfirmationInProgress(value: { emailConfirmationInProgress: boolean }): void {
		this._store.dispatch(new Auth.EmailConfirmationInProgress(value));
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
		return this._authService.processUserAuthentication$(accessToken, rememberMe, email, is2StepVerificationRequired, provider);
	}
}
