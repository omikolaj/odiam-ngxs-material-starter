import { StateToken, State, Action, StateContext, Selector } from '@ngxs/store';
import { TwoFactorAuthentication2 } from './two-factor-authentication2.model';
import { Injectable } from '@angular/core';
import * as TwoFactorAuthSetupWizard from './two-factor-authentication2.store.actions';
import produce from 'immer';
import { AuthenticatorSetup } from 'app/core/models/2fa/authenticator-setup.model.2fa';
import { TwoFactorAuthenticationStatus } from 'app/core/models/2fa/2fa-status.enum';

const TWO_FACTOR_AUTHENTICATION_STATE_TOKEN = new StateToken<TwoFactorAuthentication2>('two-factor-authentication');

@State<TwoFactorAuthentication2>({
	name: TWO_FACTOR_AUTHENTICATION_STATE_TOKEN,
	defaults: {
		sharedKey: '',
		authenticatorUri: '',
		authenticatorResult: {
			recoveryCodes: [],
			status: TwoFactorAuthenticationStatus.None
		}
	}
})
@Injectable()
export class TwoFactorAuthentication2State {
	@Selector([TWO_FACTOR_AUTHENTICATION_STATE_TOKEN])
	static selectAuthenticatorSetup(state: TwoFactorAuthentication2): AuthenticatorSetup {
		return {
			sharedKey: state.sharedKey,
			authenticatorUri: state.authenticatorUri
		} as AuthenticatorSetup;
	}

	@Action(TwoFactorAuthSetupWizard.SetupTwoFactorAuthentication)
	setupTwoFactorAuthentication(ctx: StateContext<TwoFactorAuthentication2>, action: TwoFactorAuthSetupWizard.SetupTwoFactorAuthentication): void {
		ctx.setState(
			produce((draft: TwoFactorAuthentication2) => {
				draft = { ...draft, ...action.payload };
				return draft;
			})
		);
	}
}
