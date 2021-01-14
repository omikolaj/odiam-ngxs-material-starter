import { StateToken, State, Action, StateContext, Selector } from '@ngxs/store';
import { AccountStateModel } from './account-state-model';
import { Injectable } from '@angular/core';
import * as Dash from './account.store.actions';
import produce from 'immer';
import { AccountDetails } from 'app/core/models/account-details.model';

const ACCOUNT_STATE_TOKEN = new StateToken<AccountStateModel>('account');

@State<AccountStateModel>({
	name: ACCOUNT_STATE_TOKEN,
	defaults: {
		email: '',
		emailConfirmed: false,
		hasAuthenticator: false,
		recoveryCodesLeft: '',
		twoFactorClientRemembered: false,
		twoFactorEnabled: false
	}
})
@Injectable()

/**
 * Provides all action handlers for user two factor authentication.
 */
export class DashboardState {
	@Selector([ACCOUNT_STATE_TOKEN])
	static selectUserProfileDetails(state: AccountStateModel): AccountDetails {
		return state;
	}

	@Selector([ACCOUNT_STATE_TOKEN])
	static selectHasAuthenticator(state: AccountStateModel): boolean {
		return state.hasAuthenticator;
	}

	@Selector([ACCOUNT_STATE_TOKEN])
	static selectHasTwoFactorEnabled(state: AccountStateModel): boolean {
		return state.twoFactorEnabled;
	}

	@Action(Dash.SetUserProfileDetails)
	setUserProfile(ctx: StateContext<AccountStateModel>, action: Dash.SetUserProfileDetails): void {
		ctx.setState(
			produce((draft: AccountStateModel) => {
				draft.email = action.paylaod.email;
				draft.emailConfirmed = action.paylaod.emailConfirmed;
				draft.hasAuthenticator = action.paylaod.hasAuthenticator;
				draft.recoveryCodesLeft = action.paylaod.recoveryCodesLeft;
				draft.twoFactorClientRemembered = action.paylaod.twoFactorClientRemembered;
				draft.twoFactorEnabled = action.paylaod.twoFactorEnabled;
			})
		);
	}
}
