import { Injectable } from '@angular/core';
import { TwoFactorAuthenticationAsyncService } from 'app/core/services/two-factor-authentication-async.service';
import { tap } from 'rxjs/operators';
import * as TwoFactorAuthentication from './security-container/two-factor-authentication/two-factor-authentication.store.actions';
import { Store, Select, Actions, ofActionSuccessful, ofActionCompleted } from '@ngxs/store';
import { Observable } from 'rxjs';
import { TwoFactorAuthenticationSetup } from 'app/views/account/security-container/two-factor-authentication/models/two-factor-authentication-setup.model';
import { TwoFactorAuthenticationVerificationCode } from 'app/views/account/security-container/two-factor-authentication/models/two-factor-authentication-verification-code.model';
import { TwoFactorAuthenticationSetupResult } from 'app/views/account/security-container/two-factor-authentication/models/two-factor-authentication-setup-result.model';
import { UsersAsyncService } from 'app/core/services/users-async.service';
import { AuthState } from 'app/core/auth/auth.store.state';
import { AccountSecurityState } from './security-container/security-container.store.state';
import { AccountSecurityDetails } from 'app/core/models/account-security-details.model';
import * as SecurityContainer from './security-container/security-container.store.actions';
import { TwoFactorAuthenticationState } from './security-container/two-factor-authentication/two-factor-authentication.store.state';
import { InternalServerError } from 'app/core/error-handler/internal-server-error.decorator';
import { ProblemDetailsError } from 'app/core/error-handler/problem-details-error.decorator';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';

/**
 * User account facade service.
 */
@Injectable()
export class AccountFacadeService {
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

	onCompletedUpdateRecoveryCodesAction$ = this.actions$.pipe(ofActionCompleted(SecurityContainer.UpdateRecoveryCodes));

	/**
	 * Creates an instance of account facade service.
	 * @param twoFactorAuthenticationAsync
	 */
	constructor(
		private twoFactorAuthenticationAsync: TwoFactorAuthenticationAsyncService,
		private store: Store,
		private userAsyncService: UsersAsyncService,
		private actions$: Actions
	) {}

	getUserProfile(): void {
		// const id = this.store.selectSnapshot(AuthState.selectCurrentUserId);
		// this.userAsyncService
		// 	.getUserProfile(id)
		// 	.pipe(tap((profileDetails) => this.store.dispatch(new Dash.SetUserProfileDetails(profileDetails))))
		// 	.subscribe();
	}

	/**
	 * Gets user account security details.
	 */
	getAccountSecurityInfo(): void {
		const id = this.store.selectSnapshot(AuthState.selectCurrentUserId);
		this.userAsyncService
			.getAccountSecurityDetails(id)
			.pipe(tap((accountSecurityDetails) => this.store.dispatch(new SecurityContainer.SetAccountSecurityDetails(accountSecurityDetails))))
			.subscribe();
	}

	/**
	 * Gets information for setting up authenticator for 2FA.
	 */
	setupAuthenticator(): void {
		this.twoFactorAuthenticationAsync
			.setupAuthenticator()
			.pipe(tap((authenticatorInfo) => this.store.dispatch([new TwoFactorAuthentication.SetupTwoFactorAuthentication(authenticatorInfo)])))
			.subscribe();
	}

	/**
	 * Verifys authenticator verification code is valid.
	 * @param model
	 */
	verifyAuthenticator(model: TwoFactorAuthenticationVerificationCode): void {
		this.twoFactorAuthenticationAsync
			.verifyAuthenticator(model)
			.pipe(tap((result) => this.store.dispatch(new TwoFactorAuthentication.AuthenticatorVerificationResult(result))))
			.subscribe();
	}

	/**
	 * Cancels two factor authentication setup wizard.
	 */
	cancel2faSetupWizard(): void {
		this.store.dispatch(new TwoFactorAuthentication.Reset2fa());
	}

	/**
	 * Finalizes two factor authentication.
	 * @param model
	 */
	finish2faSetup(model: TwoFactorAuthenticationSetupResult): void {
		this.store.dispatch([
			new TwoFactorAuthentication.Reset2fa(),
			new SecurityContainer.UpdateTwoFactorAuthenticationSettings({
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
		this.twoFactorAuthenticationAsync
			.generate2FaRecoveryCodes()
			.pipe(tap((result) => this.store.dispatch(new SecurityContainer.UpdateRecoveryCodes(result))))
			.subscribe();
	}

	/**
	 * Disables two factor authentication.
	 */
	disable2Fa(): void {
		this.twoFactorAuthenticationAsync
			.disable2Fa()
			.pipe(
				tap(() =>
					this.store.dispatch([
						new TwoFactorAuthentication.Reset2fa(),
						new SecurityContainer.UpdateTwoFactorAuthenticationSettings({
							hasAuthenticator: false,
							recoveryCodes: {
								items: []
							},
							recoveryCodesLeft: 0,
							twoFactorEnabled: false
						})
					])
				)
			)
			.subscribe();
	}
}
