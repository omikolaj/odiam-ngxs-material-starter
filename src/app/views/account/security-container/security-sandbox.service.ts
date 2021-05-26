import { Injectable } from '@angular/core';
import { TwoFactorAuthenticationAsyncService } from 'app/core/auth/two-factor-authentication-async.service';
import { Store, Actions, Select, ofActionCompleted } from '@ngxs/store';
import { UsersAsyncService } from 'app/shared/services/users-async.service';
import { NotificationService } from 'app/core/core.module';
import { TranslateService } from '@ngx-translate/core';
import { AuthState } from 'app/core/auth/auth.store.state';
import { tap, switchMap } from 'rxjs/operators';
import * as Security from './security-container.store.actions';
import * as TwoFactorAuthentication from './two-factor-authentication/two-factor-authentication.store.actions';
import { PasswordChange } from 'app/core/models/auth/password-change.model';
import { TwoFactorAuthenticationVerificationCode } from 'app/core/models/account/security/two-factor-authentication-verification-code.model';
import { TwoFactorAuthenticationSetupResult } from 'app/core/models/account/security/two-factor-authentication-setup-result.model';
import { ProblemDetailsError } from 'app/core/error-handler/problem-details-error.decorator';
import { Observable } from 'rxjs';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerError } from 'app/core/error-handler/internal-server-error.decorator';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { TwoFactorAuthenticationState } from './two-factor-authentication/two-factor-authentication.store.state';
import { TwoFactorAuthenticationSetup } from 'app/core/models/account/security/two-factor-authentication-setup.model';
import { AccountSecurityState } from './security-container.store.state';
import { AccountSecurityDetails } from 'app/core/models/account/security/account-security-details.model';
import { LogService } from 'app/core/logger/log.service';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

@Injectable()
export class SecuritySandboxService {
	/**
	 * Problem details error for account module.
	 */
	@ProblemDetailsError() problemDetails$: Observable<ProblemDetails>;
	/**
	 * Internal server error for account model.
	 */
	@InternalServerError() internalServerErrorDetails$: Observable<InternalServerErrorDetails>;

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
	 * Selects account security details.
	 */
	@Select(AccountSecurityState.selectAccountSecurityDetails) accountSecurityDetails$: Observable<AccountSecurityDetails>;

	/**
	 * Whether user's password change request completed successfully.
	 */
	@Select(AccountSecurityState.selectPasswordChangeCompleted) passwordChangeCompleted$: Observable<boolean>;

	/**
	 * Emits when SecurityContainer.UpdateRecoveryCodes action has triggered.
	 */
	onCompletedUpdateRecoveryCodesAction$ = this._actions$.pipe(ofActionCompleted(Security.UpdateRecoveryCodes));

	constructor(
		private _twoFactorAuthenticationAsync: TwoFactorAuthenticationAsyncService,
		private _store: Store,
		private _userAsyncService: UsersAsyncService,
		private _notificationService: NotificationService,
		private _translationService: TranslateService,
		private _actions$: Actions,
		public log: LogService,
		public fb: FormBuilder,
		public router: Router
	) {}

	/**
	 * Gets user account security details.
	 */
	getAccountSecurityInfo(): void {
		const id = this._store.selectSnapshot(AuthState.selectCurrentUserId);
		this._userAsyncService
			.getAccountSecurityDetails$(id)
			.pipe(tap((accountSecurityDetails) => this._store.dispatch(new Security.SetAccountSecurityDetails(accountSecurityDetails))))
			.subscribe();
	}

	/**
	 * Changes user's password
	 * @param model
	 */
	changePassword(model: PasswordChange): void {
		const id = this._store.selectSnapshot(AuthState.selectCurrentUserId);
		this._userAsyncService
			.changePassword$(id, model)
			.pipe(
				switchMap(() => this._translationService.get('odm.account.security.change-password.success')),
				tap((message: string) => {
					this._store.dispatch(new Security.PasswordChangeCompleted({ passwordChangeCompleted: true }));
					this._notificationService.success(message);
				})
			)
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
			new Security.UpdateAccountSecurityDetailsSettings({
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
			.pipe(tap((result) => this._store.dispatch(new Security.UpdateRecoveryCodes(result))))
			.subscribe();
	}

	/**
	 * Disables two factor authentication.
	 */
	disable2Fa(): void {
		this._twoFactorAuthenticationAsync
			.disable2Fa$()
			.pipe(tap(() => this._store.dispatch([new TwoFactorAuthentication.Reset2faSetupWizard(), new Security.ResetAccountSecuritySettings()])))
			.subscribe();
	}
}
