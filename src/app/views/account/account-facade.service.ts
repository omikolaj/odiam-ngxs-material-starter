import { Injectable } from '@angular/core';
import { TwoFactorAuthenticationAsyncService } from 'app/core/services/two-factor-authentication-async.service';
import { tap, map } from 'rxjs/operators';
import * as TwoFactorAuthentication from './two-factor-authentication/two-factor-authentication.store.actions';
import { Store, Select } from '@ngxs/store';
import { TwoFactorAuthenticationState } from './two-factor-authentication/two-factor-authentication.store.state';
import { Observable, combineLatest } from 'rxjs';
import { AuthenticatorSetupModel } from 'app/core/models/2fa/authenticator-setup.model.2fa';
import { AuthenticatorVerificationCodeModel } from 'app/core/models/2fa/authenticator-verification-code-model.2fa';
import { AuthenticatorSetupResultModel } from 'app/core/models/2fa/authenticator-setup-result-model.2fa';
import { UsersAsyncService } from 'app/core/services/users-async.service';
import * as Dash from './account/account.store.actions';
import { AccountDetails } from 'app/core/models/account-details.model';
import { DashboardState } from './account/account.store.state';
import { AuthState } from 'app/core/auth/auth.store.state';
import { TwoFactorConfigurationStatus } from 'app/core/models/2fa/2fa-configuration-status.model';

/**
 * User account facade service.
 */
@Injectable()
export class AccountFacadeService {
	/**
	 * Select authenticator setup model.
	 */
	@Select(TwoFactorAuthenticationState.selectAuthenticatorSetup) authenticatorSetupModel$: Observable<AuthenticatorSetupModel>;

	@Select(DashboardState.selectHasTwoFactorEnabled) hasTwoFactorEnabled$: Observable<boolean>;

	/**
	 * Selects authenticator setup result model.
	 */
	@Select(TwoFactorAuthenticationState.selectAuthenticatorSetupResult) authenticatorSetupResultModel$: Observable<AuthenticatorSetupResultModel>;
	// @Select(TwoFactorAuthenticationState.selectRecoveryCodes) recoveryCodes$: Observable<string[]>;

	recoveryCodes$ = combineLatest([
		this.store.select(TwoFactorAuthenticationState.selectRecoveryCodes),
		this.store.select(TwoFactorAuthenticationState.selectNewRecoveryCodes)
	]).pipe(
		map((recoveryCodes: [string[], string[]]) => {
			return recoveryCodes[0].concat(recoveryCodes[1]).filter((codes) => codes !== '');
		})
	);

	@Select(DashboardState.selectUserProfileDetails) accountDetails$: Observable<AccountDetails>;

	@Select(DashboardState.selectHasAuthenticator) hasAuthenticator$: Observable<boolean>;

	@Select(DashboardState.selectTwoFactorConfigurationStatus) twoFactorConfigurationStatus$: Observable<TwoFactorConfigurationStatus>;

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
	 * Gets information for setting up authenticator for 2FA.
	 */
	setupAuthenticator(): void {
		this.twoFactorAuthenticationAsync
			.setupAuthenticator()
			.pipe(
				tap((authenticatorInfo) =>
					this.store.dispatch([
						new TwoFactorAuthentication.AuthenticatorSetup(authenticatorInfo),
						new Dash.UpdateTwoFactorConfigurationStatus('Configuring')
					])
				)
			)
			.subscribe();
	}

	/**
	 * Verifys authenticator verification code is valid.
	 * @param model
	 */
	verifyAuthenticator(model: AuthenticatorVerificationCodeModel): void {
		this.twoFactorAuthenticationAsync
			.verifyAuthenticator(model)
			.pipe(
				tap((authenticatorResult) =>
					this.store.dispatch([
						new TwoFactorAuthentication.AuthenticatorVerificationResult(authenticatorResult),
						new Dash.UpdateTwoFactorConfigurationStatus('Enabled')
					])
				)
			)
			.subscribe();
	}

	/**
	 * Generates recovery codes.
	 */
	generateRecoveryCodes(): void {
		this.twoFactorAuthenticationAsync
			.generate2FaRecoveryCodes()
			.pipe(tap((result) => this.store.dispatch(new TwoFactorAuthentication.GenerateRecoveryCodes(result))))
			.subscribe();
	}

	/**
	 * Disables two factor authentication.
	 */
	disable2Fa(): void {
		this.twoFactorAuthenticationAsync
			.disable2Fa()
			.pipe(tap(() => this.store.dispatch([new TwoFactorAuthentication.Disable2Fa(), new Dash.UpdateTwoFactorConfigurationStatus('Disabled')])))
			.subscribe();
	}
}
