import { StateToken, State, Action, StateContext, Selector } from '@ngxs/store';
import { TwoFactorAuthenticationStateModel } from './two-factor-authentication-state.store.model';
import { Injectable } from '@angular/core';
import * as TwoFactorAuthentication from './two-factor-authentication.store.actions';
import produce from 'immer';
import { LogService } from 'app/core/logger/log.service';
import { TwoFactorAuthenticationSetup } from 'app/core/models/account/security/two-factor-authentication-setup.model';
import { TwoFactorAuthenticationSetupResult } from 'app/core/models/account/security/two-factor-authentication-setup-result.model';

const TWO_FACTOR_AUTHENTICATION_STATE_TOKEN = new StateToken<TwoFactorAuthenticationStateModel>('twoFactorAuthentication');

@State<TwoFactorAuthenticationStateModel>({
	name: TWO_FACTOR_AUTHENTICATION_STATE_TOKEN,
	defaults: {
		sharedKey: '',
		authenticatorUri: '',
		authenticatorResult: {
			recoveryCodes: {
				items: []
			},
			status: 'None'
		}
	}
})
@Injectable()
/**
 * Provides state for two factor authentication setup.
 */
export class TwoFactorAuthenticationState {
	/**
	 * Selects authenticator setup details.
	 * @param state
	 * @returns authenticator setup
	 */
	@Selector([TWO_FACTOR_AUTHENTICATION_STATE_TOKEN])
	static selectAuthenticatorSetup(state: TwoFactorAuthenticationStateModel): TwoFactorAuthenticationSetup {
		return {
			sharedKey: state.sharedKey,
			authenticatorUri: state.authenticatorUri
		} as TwoFactorAuthenticationSetup;
	}

	/**
	 * Selects authenticator setup result.
	 * @param state
	 * @returns authenticator setup result
	 */
	@Selector([TWO_FACTOR_AUTHENTICATION_STATE_TOKEN])
	static selectAuthenticatorSetupResult(state: TwoFactorAuthenticationStateModel): TwoFactorAuthenticationSetupResult {
		return state.authenticatorResult;
	}

	/**
	 * Creates an instance of two factor authentication state.
	 * @param _log
	 */
	constructor(private _log: LogService) {}

	/**
	 * Actions handler for getting details for two factor authentication setup wizard.
	 * @param ctx
	 * @param action
	 */
	@Action(TwoFactorAuthentication.SetupTwoFactorAuthentication)
	setupTwoFactorAuthentication(
		ctx: StateContext<TwoFactorAuthenticationStateModel>,
		action: TwoFactorAuthentication.SetupTwoFactorAuthentication
	): void {
		this._log.info('setupTwoFactorAuthentication action handler fired.', this);
		ctx.setState(
			produce((draft: TwoFactorAuthenticationStateModel) => {
				draft = { ...draft, ...action.payload };
				return draft;
			})
		);
	}

	/**
	 * Actions handler for setting authenticator setup result.
	 * @param ctx
	 * @param action
	 */
	@Action(TwoFactorAuthentication.AuthenticatorVerificationResult)
	twoFactorAuthenticationSetupResult(
		ctx: StateContext<TwoFactorAuthenticationStateModel>,
		action: TwoFactorAuthentication.AuthenticatorVerificationResult
	): void {
		this._log.info('twoFactorAuthenticationSetupResult action handler fired.', this);
		ctx.setState(
			produce((draft: TwoFactorAuthenticationStateModel) => {
				draft = {
					...draft,
					authenticatorResult: {
						...action.payload
					}
				};
				return draft;
			})
		);
	}

	/**
	 * Actions handler for resetting two factor authentication setup.
	 * @param ctx
	 * @param action
	 */
	@Action(TwoFactorAuthentication.Reset2faSetupWizard)
	resetTwoFactorAuthenticationSetupWizard(ctx: StateContext<TwoFactorAuthenticationStateModel>): void {
		this._log.info('resetTwoFactorAuthenticationSetupWizard action handler fired.', this);
		const defaults: TwoFactorAuthenticationStateModel = {
			authenticatorResult: {
				recoveryCodes: {
					items: []
				},
				status: 'None'
			},
			authenticatorUri: '',
			sharedKey: ''
		};

		ctx.setState(
			produce((draft: TwoFactorAuthenticationStateModel) => {
				draft = defaults;
				return draft;
			})
		);
	}
}
