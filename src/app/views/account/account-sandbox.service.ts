import { Injectable } from '@angular/core';
import { TwoFactorAuthenticationAsyncService } from 'app/core/services/two-factor-authentication-async.service';
import { tap } from 'rxjs/operators';
import * as TwoFactorAuthentication from './security-container/two-factor-authentication/two-factor-authentication.store.actions';
import { Store, Select, Actions, ofActionCompleted } from '@ngxs/store';
import { Observable } from 'rxjs';
import { UsersAsyncService } from 'app/core/services/users-async.service';
import { AuthState } from 'app/core/auth/auth.store.state';
import { AccountSecurityState } from './security-container/security-container.store.state';
import { AccountSecurityDetails } from 'app/core/models/account/security/account-security-details.model';
import * as SecurityContainer from './security-container/security-container.store.actions';
import * as GeneralContainer from './general-container/general-container.store.actions';
import { TwoFactorAuthenticationState } from './security-container/two-factor-authentication/two-factor-authentication.store.state';
import { InternalServerError } from 'app/core/error-handler/internal-server-error.decorator';
import { ProblemDetailsError } from 'app/core/error-handler/problem-details-error.decorator';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { LogService } from 'app/core/logger/log.service';
import { FormBuilder } from '@angular/forms';
import { TranslateValidationErrorsService } from 'app/shared/services/translate-validation-errors.service';
import { AccountGeneralState } from './general-container/general-container.store.state';
import { AccountGeneralDetails } from 'app/core/models/account/general/account-general-details.model';
import { TwoFactorAuthenticationSetup } from 'app/core/models/account/security/two-factor-authentication-setup.model';
import { TwoFactorAuthenticationSetupResult } from 'app/core/models/account/security/two-factor-authentication-setup-result.model';
import { TwoFactorAuthenticationVerificationCode } from 'app/core/models/account/security/two-factor-authentication-verification-code.model';

/**
 * Account sandbox service.
 */
@Injectable()
export class AccountSandboxService {
	/**
	 * Problem details error for account module.
	 */
	@ProblemDetailsError() problemDetails$: Observable<ProblemDetails>;
	/**
	 * Internal server error for account model.
	 */
	@InternalServerError() internalServerErrorDetails$: Observable<InternalServerErrorDetails>;
	/**
	 * Selects account security details.
	 */
	@Select(AccountSecurityState.selectAccountSecurityDetails) accountSecurityDetails$: Observable<AccountSecurityDetails>;

	/**
	 * Selects two factor authentication setup details.
	 */
	@Select(TwoFactorAuthenticationState.selectAuthenticatorSetup)
	twoFactorAuthenticationSetup$: Observable<TwoFactorAuthenticationSetup>;

	/**
	 * Selects authenticator setup result model.
	 */
	@Select(TwoFactorAuthenticationState.selectAuthenticatorSetupResult) twoFactorAuthenticationSetupResult$: Observable<
		TwoFactorAuthenticationSetupResult
	>;

	/**
	 * Select users general details.
	 */
	@Select(AccountGeneralState.selectAccountGeneralDetails) accountGeneralDetails$: Observable<AccountGeneralDetails>;

	/**
	 * Emits when SecurityContainer.UpdateRecoveryCodes action has triggered.
	 */
	onCompletedUpdateRecoveryCodesAction$ = this._actions$.pipe(ofActionCompleted(SecurityContainer.UpdateRecoveryCodes));

	/**
	 * Creates an instance of account sandbox service.
	 * @param _twoFactorAuthenticationAsync
	 * @param _store
	 * @param _userAsyncService
	 * @param _actions$
	 * @param log
	 * @param fb
	 * @param translateValidationErrorService
	 */
	constructor(
		private _twoFactorAuthenticationAsync: TwoFactorAuthenticationAsyncService,
		private _store: Store,
		private _userAsyncService: UsersAsyncService,
		private _actions$: Actions,
		public log: LogService,
		public fb: FormBuilder,
		public translateValidationErrorService: TranslateValidationErrorsService
	) {}

	/**
	 * Gets user account security details.
	 */
	getAccountSecurityInfo(): void {
		const id = this._store.selectSnapshot(AuthState.selectCurrentUserId);
		this._userAsyncService
			.getAccountSecurityDetails$(id)
			.pipe(tap((accountSecurityDetails) => this._store.dispatch(new SecurityContainer.SetAccountSecurityDetails(accountSecurityDetails))))
			.subscribe();
	}

	/**
	 * Gets user account general details.
	 */
	getAccountGeneralInfo(): void {
		const id = this._store.selectSnapshot(AuthState.selectCurrentUserId);
		this._userAsyncService
			.getAccountGeneralDetails$(id)
			.pipe(tap((accountGeneralDetails) => this._store.dispatch(new GeneralContainer.SetAccountGeneralDetails(accountGeneralDetails))))
			.subscribe();
	}

	/**
	 * Gets information for setting up authenticator for 2FA.
	 */
	setupAuthenticator(): void {
		this._twoFactorAuthenticationAsync
			.setupAuthenticator$()
			.pipe(tap((authenticatorInfo) => this._store.dispatch([new TwoFactorAuthentication.SetupTwoFactorAuthentication(authenticatorInfo)])))
			.subscribe();
	}

	/**
	 * Verifys authenticator verification code is valid.
	 * @param model
	 */
	verifyAuthenticator(model: TwoFactorAuthenticationVerificationCode): void {
		this._twoFactorAuthenticationAsync
			.verifyAuthenticator$(model)
			.pipe(tap((result) => this._store.dispatch(new TwoFactorAuthentication.AuthenticatorVerificationResult(result))))
			.subscribe();
	}

	/**
	 * Cancels two factor authentication setup wizard.
	 */
	cancel2faSetupWizard(): void {
		this._store.dispatch(new TwoFactorAuthentication.Reset2faSetupWizard());
	}

	/**
	 * Finalizes two factor authentication.
	 * @param model
	 */
	finish2faSetup(model: TwoFactorAuthenticationSetupResult): void {
		this._store.dispatch([
			new TwoFactorAuthentication.Reset2faSetupWizard(),
			new SecurityContainer.UpdateAccountSecurityDetailsSettings({
				hasAuthenticator: true,
				recoveryCodes: model.recoveryCodes,
				recoveryCodesLeft: model.recoveryCodes.items.length,
				twoFactorEnabled: model.status === 'Succeeded'
			})
		]);
	}

	/**
	 * Generates recovery codes.
	 */
	generateRecoveryCodes(): void {
		this._twoFactorAuthenticationAsync
			.generate2FaRecoveryCodes$()
			.pipe(tap((result) => this._store.dispatch(new SecurityContainer.UpdateRecoveryCodes(result))))
			.subscribe();
	}

	/**
	 * Disables two factor authentication.
	 */
	disable2Fa(): void {
		this._twoFactorAuthenticationAsync
			.disable2Fa$()
			.pipe(
				tap(() => this._store.dispatch([new TwoFactorAuthentication.Reset2faSetupWizard(), new SecurityContainer.ResetAccountSecuritySettings()]))
			)
			.subscribe();
	}

	/**
	 * Resends email verification.
	 */
	resendEmailVerification(): void {
		const id = this._store.selectSnapshot(AuthState.selectCurrentUserId);
		this._userAsyncService.resendEmailVerification$(id).subscribe();
	}
}
