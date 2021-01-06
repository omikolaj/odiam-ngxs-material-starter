import { StateToken, State, Action, StateContext, Selector } from '@ngxs/store';
import { TwoFactorAuthenticationStateModel } from './two-factor-authentication-state.model';
import { Injectable } from '@angular/core';
import * as TwoFactorAuthentication from './two-factor-authentication.store.actions';
import produce from 'immer';
import { TwoFactorAuthenticationSetup } from 'app/views/account/security-container/two-factor-authentication/models/two-factor-authentication-setup.model';
import { TwoFactorAuthenticationSetupResult } from 'app/views/account/security-container/two-factor-authentication/models/two-factor-authentication-setup-result.model';

const TWO_FACTOR_AUTHENTICATION_STATE_TOKEN = new StateToken<TwoFactorAuthenticationStateModel>('twoFactorAuthentication');

@State<TwoFactorAuthenticationStateModel>({
	name: TWO_FACTOR_AUTHENTICATION_STATE_TOKEN,
	defaults: {
		sharedKey: '',
		authenticatorUri: '',
		authenticatorResult: {
			recoveryCodes: [],
			status: 'None'
		}
	}
})
@Injectable()
export class TwoFactorAuthenticationState {
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

	@Action(TwoFactorAuthentication.SetupTwoFactorAuthentication)
	setupTwoFactorAuthentication(
		ctx: StateContext<TwoFactorAuthenticationStateModel>,
		action: TwoFactorAuthentication.SetupTwoFactorAuthentication
	): void {
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
	TwoFactorAuthenticationSetupResult(
		ctx: StateContext<TwoFactorAuthenticationStateModel>,
		action: TwoFactorAuthentication.AuthenticatorVerificationResult
	): void {
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
	 * Actions handler for setting authenticator setup result.
	 * @param ctx
	 * @param action
	 */
	@Action(TwoFactorAuthentication.Disable2Fa)
	disableTwoFactorAuthentication(ctx: StateContext<TwoFactorAuthenticationStateModel>): void {
		ctx.setState(
			produce((draft: TwoFactorAuthenticationStateModel) => {
				draft = {
					authenticatorResult: {
						recoveryCodes: [],
						status: 'None'
					},
					authenticatorUri: '',
					sharedKey: ''
				};
				return draft;
			})
		);
	}
}
