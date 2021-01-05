import { Injectable } from '@angular/core';
import { TwoFactorAuthenticationAsyncService } from 'app/core/services/two-factor-authentication-async.service';
import { tap, map } from 'rxjs/operators';
import * as TwoFactorAuthenticationSetupWizard from './two-factor-authentication2/two-factor-authentication2.store.actions';
import { Store, Select } from '@ngxs/store';
import { TwoFactorAuthenticationState } from './two-factor-authentication/two-factor-authentication.store.state';
import { Observable, combineLatest } from 'rxjs';
import { AuthenticatorSetup } from 'app/core/models/2fa/authenticator-setup.model.2fa';
import { AuthenticatorVerificationCode } from 'app/core/models/2fa/authenticator-verification-code.model.2fa';
import { AuthenticatorSetupResult } from 'app/core/models/2fa/authenticator-setup-result.model.2fa';
import { UsersAsyncService } from 'app/core/services/users-async.service';
import * as Dash from './account/account.store.actions';
import { AccountDetails } from 'app/core/models/account-details.model';
import { DashboardState } from './account/account.store.state';
import { AuthState } from 'app/core/auth/auth.store.state';
import { TwoFactorConfigurationStatus } from 'app/core/models/2fa/2fa-configuration-status.model';
import { AccountSecurityState } from './account-security/account-security.store.state';
import { AccountSecurityDetails } from 'app/core/models/account-security-details.model';
import * as AccountSecurity from './account-security/account-security.store.actions';
import { TwoFactorAuthenticationSetupWizardState } from './two-factor-authentication2/two-factor-authentication2.store.state';

/**
 * User account facade service.
 */
@Injectable()
export class AccountFacadeService {
	@Select(AccountSecurityState.selectAccountSecurityDetails) accountSecurityDetails$: Observable<AccountSecurityDetails>;

	@Select(TwoFactorAuthenticationSetupWizardState.selectAuthenticatorSetup) authenticatorSetup$: Observable<AuthenticatorSetup>;

	/**
	 * Selects authenticator setup result model.
	 */
	@Select(TwoFactorAuthenticationState.selectAuthenticatorSetupResult) authenticatorSetupResult$: Observable<AuthenticatorSetupResult>;

	/**
	 * Creates an instance of account facade service.
	 * @param twoFactorAuthenticationAsync
	 */
	constructor(
		private twoFactorAuthenticationAsync: TwoFactorAuthenticationAsyncService,
		private store: Store,
		private userAsyncService: UsersAsyncService
	) {}

	getUserProfile(): void {
		const id = this.store.selectSnapshot(AuthState.selectCurrentUserId);
		this.userAsyncService
			.getUserProfile(id)
			.pipe(tap((profileDetails) => this.store.dispatch(new Dash.SetUserProfileDetails(profileDetails))))
			.subscribe();
	}

	/**
	 * Gets user account security details.
	 */
	getAccountSecurityInfo(): void {
		const id = this.store.selectSnapshot(AuthState.selectCurrentUserId);
		this.userAsyncService
			.getAccountSecurityDetails(id)
			.pipe(tap((accountSecurityDetails) => this.store.dispatch(new AccountSecurity.SetAccountSecurityDetails(accountSecurityDetails))))
			.subscribe();
	}

	/**
	 * Gets information for setting up authenticator for 2FA.
	 */
	setupAuthenticator(): void {
		this.twoFactorAuthenticationAsync
			.setupAuthenticator()
			.pipe(tap((authenticatorInfo) => this.store.dispatch([new TwoFactorAuthenticationSetupWizard.SetupTwoFactorAuthentication(authenticatorInfo)])))
			.subscribe();
	}

	/**
	 * Verifys authenticator verification code is valid.
	 * @param model
	 */
	verifyAuthenticator(model: AuthenticatorVerificationCode): void {
		// this.twoFactorAuthenticationAsync
		// 	.verifyAuthenticator(model)
		// 	.pipe(
		// 		tap((authenticatorResult) =>
		// 			this.store.dispatch([
		// 				new TwoFactorAuthentication.AuthenticatorVerificationResult(authenticatorResult),
		// 				new Dash.UpdateTwoFactorConfigurationStatus('Enabled')
		// 			])
		// 		)
		// 	)
		// 	.subscribe();
	}

	/**
	 * Generates recovery codes.
	 */
	generateRecoveryCodes(): void {
		// this.twoFactorAuthenticationAsync
		// 	.generate2FaRecoveryCodes()
		// 	.pipe(tap((result) => this.store.dispatch(new TwoFactorAuthentication.GenerateRecoveryCodes(result))))
		// 	.subscribe();
	}

	/**
	 * Disables two factor authentication.
	 */
	disable2Fa(): void {
		// this.twoFactorAuthenticationAsync
		// 	.disable2Fa()
		// 	.pipe(tap(() => this.store.dispatch([new TwoFactorAuthentication.Disable2Fa(), new Dash.UpdateTwoFactorConfigurationStatus('Disabled')])))
		// 	.subscribe();
	}
}
