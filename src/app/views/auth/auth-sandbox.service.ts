import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Actions, ofActionCompleted, Select, Store } from '@ngxs/store';
import { AuthAsyncService } from 'app/core/auth/auth-async.service';
import { AuthState } from 'app/core/auth/auth.store.state';
import { JsonWebTokenService } from 'app/core/auth/json-web-token.service';
import { TwoFactorAuthenticationAsyncService } from 'app/core/auth/two-factor-authentication-async.service';
import { NotificationService } from 'app/core/core.module';
import { InternalServerError } from 'app/core/error-handler/internal-server-error.decorator';
import { ProblemDetailsError } from 'app/core/error-handler/problem-details-error.decorator';
import { AsyncValidatorsService } from 'app/core/form-validators/validators-async.service';
import { LogService } from 'app/core/logger/log.service';
import { TwoFactorAuthenticationVerificationCode } from 'app/core/models/account/security/two-factor-authentication-verification-code.model';
import { AccessToken } from 'app/core/models/auth/access-token.model';
import { ActiveAuthType } from 'app/core/models/auth/active-auth-type.model';
import { ChangeEmail } from 'app/core/models/auth/change-email.model';
import { ConfirmEmail } from 'app/core/models/auth/confirm-email.model';
import { PasswordReset } from 'app/core/models/auth/password-reset.model';
import { SigninUser } from 'app/core/models/auth/signin-user.model';
import { SignupUser } from 'app/core/models/auth/signup-user.model';
import { TwoFactorRecoveryCode } from 'app/core/models/auth/two-factor-recovery-code.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { TranslateValidationErrorsService } from 'app/shared/services/translate-validation-errors.service';
import { UsersAsyncService } from 'app/shared/services/users-async.service';
import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { AuthService } from '../../core/auth/auth.service';
import * as Auth from '../../core/auth/auth.store.actions';

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
	 * Whether two step verification process is required.
	 */
	@Select(AuthState.selectIsTwoStepVerificationRequired) isTwoStepVerificationRequired$: Observable<boolean>;

	/**
	 * Two step verification process provider.
	 */
	@Select(AuthState.selectTwoStepVerificationProvider) twoStepVerificationProvider$: Observable<string>;

	/**
	 * Twp step verification process email. This the user's email.
	 */
	@Select(AuthState.selectTwoStepVerificationEmail) twoStepVerificationEmail$: Observable<string>;

	/**
	 * Whether user is authenticated.
	 */
	@Select(AuthState.selectIsAuthenticated) isAuthenticated$: Observable<boolean>;

	/**
	 * Whether user is in the process of signing in.
	 */
	@Select(AuthState.selectIsSigningInUserInProgress) isSigningInUserInProgress$: Observable<boolean>;

	/**
	 * Whether user's forgot password request was successfully handled by the server.
	 */
	@Select(AuthState.selectForgotPasswordRequestSubmittedSuccessfully) forgotPasswordRequestSubmittedSuccessfully$: Observable<boolean>;

	/**
	 * Whether there is an outgoing request to send forgot password instructions
	 */
	@Select(AuthState.selectForgotPasswordRequestSubmitting) forgotPasswordRequestSubmitting$: Observable<boolean>;

	/**
	 * Whether Auth.Signin action has been dispatched and completed.
	 */
	signInActionCompleted$ = this._actions$.pipe(ofActionCompleted(Auth.Signin));

	/**
	 * Whether user has cancelled out of the two step verification process.
	 */
	twoStepVerificationCancelled$ = this._actions$.pipe(ofActionCompleted(Auth.TwoStepVerificationProcessCancelled));

	/**
	 * Creates an instance of auth sandbox service.
	 * @param _authAsyncService
	 * @param _usersAsyncService
	 * @param _store
	 * @param _socialAuthService
	 * @param _authService,
	 * @param _actions$
	 * @param _jwtService
	 * @param _notificationService
	 * @param _translationService
	 * @param translateValidationErrorService
	 * @param log
	 * @param fb
	 * @param router
	 * @param asyncValidators
	 */
	constructor(
		private _authAsyncService: AuthAsyncService,
		private _twoFactorAuthenticationAsync: TwoFactorAuthenticationAsyncService,
		private _usersAsyncService: UsersAsyncService,
		private _store: Store,
		private _authService: AuthService,
		private _actions$: Actions,
		private _jwtService: JsonWebTokenService,
		private _notificationService: NotificationService,
		private _translationService: TranslateService,
		public translateValidationErrorService: TranslateValidationErrorsService,
		public log: LogService,
		public fb: FormBuilder,
		public router: Router,
		public asyncValidators: AsyncValidatorsService
	) {}

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
		this.forgotPasswordRequestSubmitting({ forgotPasswordRequestSubmitting: true });

		this._usersAsyncService
			.forgotPassword$(email)
			.pipe(
				tap(() => {
					this.forgotPasswordRequestSubmitting({ forgotPasswordRequestSubmitting: false });
					this.forgotPasswordRequestSubmittedSuccessfully({ forgotPasswordRequestSubmittedSuccessfully: true });
				})
			)
			.subscribe();
	}

	/**
	 * Dispatches action to the store whether forgot password request submitted successfully.
	 * @param value
	 */
	forgotPasswordRequestSubmittedSuccessfully(value: { forgotPasswordRequestSubmittedSuccessfully: boolean }): void {
		this._store.dispatch(new Auth.ForgotPasswordRequestSubmittedSuccessfully(value));
	}

	/**
	 * Dispatches action to the store whether there is an outgoing request to send forgot password instructions.
	 * @param value
	 */
	forgotPasswordRequestSubmitting(value: { forgotPasswordRequestSubmitting: boolean }): void {
		this._store.dispatch(new Auth.ForgotPasswordRequestSubmitting(value));
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
			.pipe(
				tap((resp) => {
					this.userRegistrationCompleted({ registrationCompleted: true });
					this._signUserIn(resp);
				})
			)
			.subscribe();
	}

	/**
	 * Signs user in.
	 * @param model
	 */
	signinUser(model: SigninUser): void {
		this.signingInUserInProgress({ signingInUserInProgress: true });

		this._authAsyncService
			.signin$(model)
			.pipe(
				switchMap((resp) =>
					this._authenticateUsingAppSignin$(resp.accessToken, model.rememberMe, model.email, resp.is2StepVerificationRequired, resp.provider)
				)
			)
			.subscribe();
	}

	/**
	 * Verifys two step verification code
	 * @param model
	 */
	verifyTwoStepVerificationCode(model: TwoFactorAuthenticationVerificationCode): void {
		this._twoFactorAuthenticationAsync
			.verifyTwoStepVerificationCode$(model)
			.pipe(
				tap((accessToken) => {
					this._signUserIn(accessToken);
					this._store.dispatch(new Auth.Is2StepVerificationSuccessful({ is2StepVerificationSuccessful: true }));
				}),
				switchMap(() => this._monitorSession$())
			)
			.subscribe();
	}

	/**
	 * Cancels two step verification process.
	 * @param model
	 */
	cancelTwoStepVerificationCodeProcess(): void {
		this._store.dispatch(new Auth.TwoStepVerificationProcessCancelled());
	}

	/**
	 * Redeems users backup code and signs them in.
	 * @param model
	 */
	redeemRecoveryCode(model: TwoFactorRecoveryCode): void {
		this._twoFactorAuthenticationAsync
			.redeemRecoveryCode$(model)
			.pipe(
				tap((accessToken) => {
					this._signUserIn(accessToken);
					this._store.dispatch(new Auth.IsRedeemRecoveryCodeSuccessful({ isRedeemRecoveryCodeSuccessful: true }));
				}),
				switchMap(() => this._monitorSession$())
			)
			.subscribe();
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
		this._usersAsyncService
			.confirmEmail$(model)
			.pipe(
				tap(() => this.emailConfirmationInProgress({ emailConfirmationInProgress: false })),
				switchMap(() => this._translationService.get('odm.auth.verification.toast-message')),
				tap((message: string) => this._notificationService.success(message))
			)
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
	 * Dispatches an action to the store whether user is in process of signing in.
	 * @param value
	 */
	signingInUserInProgress(value: { signingInUserInProgress: boolean }): void {
		this._store.dispatch(new Auth.SigningInUserInProgress(value));
	}

	/**
	 * Monitors user's session for inactivity.
	 * @returns session$
	 */
	private _monitorSession$(): Observable<any> {
		return this._authService.monitorSessionActivity$();
	}

	/**
	 * Dispatches an action to the store to sign user in.
	 * @param accessToken
	 */
	private _signUserIn(accessToken: AccessToken): void {
		const userId = this._jwtService.getSubClaim(accessToken.access_token);
		this._store.dispatch(new Auth.Signin({ accessToken, userId }));
	}

	/**
	 * Attempts to authenticate user via standard app's signin flow
	 * @param accessToken
	 * @param rememberMe
	 * @param email
	 * @param is2StepVerificationRequired
	 * @param provider
	 * @returns using app signin$
	 */
	private _authenticateUsingAppSignin$(
		accessToken: AccessToken,
		rememberMe: boolean,
		email: string,
		is2StepVerificationRequired: boolean,
		provider: string
	): Observable<any> {
		return this._authService.processAppSigninAuthentication$(accessToken, rememberMe, email, is2StepVerificationRequired, provider);
	}
}
