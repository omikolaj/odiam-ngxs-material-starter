import { TwoFactorAuthenticationStateModel } from './two-factor-authentication-state-model';
import { StateToken, State, Selector, Action, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import produce from 'immer';
import * as TwoFactorAuthentication from './two-factor-authentication.store.actions';
import { AuthenticatorSetupModel } from 'app/core/models/2fa/authenticator-setup.model.2fa';
import { AuthenticatorSetupResultModel } from 'app/core/models/2fa/authenticator-setup-result-model.2fa';
import { TwoFactorAuthenticationStatus } from 'app/core/models/2fa/2fa-status.enum';

const SECURITY_STATE_TOKEN = new StateToken<TwoFactorAuthenticationStateModel>('2fa');

@State<TwoFactorAuthenticationStateModel>({
	name: SECURITY_STATE_TOKEN,
	defaults: {
		authenticatorSetup: {
			authenticatorUri: '',
			sharedKey: ''
		},
		authenticationSetupResult: {
			status: TwoFactorAuthenticationStatus.None,
			recoveryCodes: []
		},
		newRecoveryCodes: []
	}
})
@Injectable()

/**
 * Provides all action handlers for user two factor authentication.
 */
export class TwoFactorAuthenticationState {
	/**
	 * Selects authenticator setup model.
	 * @param state
	 * @returns authenticator setup
	 */
	@Selector([SECURITY_STATE_TOKEN])
	static selectAuthenticatorSetup(state: TwoFactorAuthenticationStateModel): AuthenticatorSetupModel {
		return state.authenticatorSetup;
	}

	/**
	 * Selects authenticator setup result.
	 * @param state
	 * @returns authenticator setup result
	 */
	@Selector([SECURITY_STATE_TOKEN])
	static selectAuthenticatorSetupResult(state: TwoFactorAuthenticationStateModel): AuthenticatorSetupResultModel {
		return state.authenticationSetupResult;
	}

	@Selector([SECURITY_STATE_TOKEN])
	static selectRecoveryCodes(state: TwoFactorAuthenticationStateModel): string[] {
		return state.authenticationSetupResult.recoveryCodes;
	}

	/**
	 * Action handler for setting authenticator setup model.
	 * @param ctx
	 * @param action
	 */
	@Action(TwoFactorAuthentication.AuthenticatorSetup)
	setupAuthenticator(ctx: StateContext<TwoFactorAuthenticationStateModel>, action: TwoFactorAuthentication.AuthenticatorSetup): void {
		ctx.setState(
			produce((draft: TwoFactorAuthenticationStateModel) => {
				draft.authenticatorSetup = action.paylaod;
			})
		);
	}

	/**
	 * Actions handler for setting authenticator setup result.
	 * @param ctx
	 * @param action
	 */
	@Action(TwoFactorAuthentication.AuthenticatorVerificationResult)
	authenticatorSetupResult(
		ctx: StateContext<TwoFactorAuthenticationStateModel>,
		action: TwoFactorAuthentication.AuthenticatorVerificationResult
	): void {
		ctx.setState(
			produce((draft: TwoFactorAuthenticationStateModel) => {
				draft.authenticationSetupResult = action.payload;
			})
		);
	}

	/**
	 * Actions handler that sets status of two factor authentication.
	 * @param ctx
	 * @param action
	 */
	@Action(TwoFactorAuthentication.Disable2Fa)
	disable2Fa(ctx: StateContext<TwoFactorAuthenticationStateModel>): void {
		ctx.setState(
			produce((draft: TwoFactorAuthenticationStateModel) => {
				draft.authenticatorSetup = { authenticatorUri: '', sharedKey: '' };
				draft.authenticationSetupResult = { status: TwoFactorAuthenticationStatus.None };
			})
		);
	}

	/**
	 * Actions handler that sets generated recovery codes.
	 * @param ctx
	 * @param action
	 */
	@Action(TwoFactorAuthentication.GenerateRecoveryCodes)
	generateRecoveryCodes(ctx: StateContext<TwoFactorAuthenticationStateModel>, action: TwoFactorAuthentication.GenerateRecoveryCodes): void {
		ctx.setState(
			produce((draft: TwoFactorAuthenticationStateModel) => {
				draft.newRecoveryCodes = action.payload.recoveryCodes;
			})
		);
	}
}