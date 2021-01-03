import { StateToken, State, Action, StateContext, Selector } from '@ngxs/store';
import { AccountStateModel } from './account-state-model';
import { Injectable } from '@angular/core';
import * as Dash from './account.store.actions';
import produce from 'immer';
import { AccountDetails } from 'app/core/models/account-details.model';
import { TwoFactorConfigurationStatus } from 'app/core/models/2fa/2fa-configuration-status.model';

const ACCOUNT_STATE_TOKEN = new StateToken<AccountStateModel>('account');

@State<AccountStateModel>({
	name: ACCOUNT_STATE_TOKEN,
	defaults: {
		email: '',
		emailConfirmed: false,
		externalLogins: [],
		hasAuthenticator: false,
		recoveryCodesLeft: '',
		twoFactorClientRemembered: false,
		twoFactorEnabled: false,
		twoFactorConfigurationStatus: 'NotConfigured'
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

	@Selector([ACCOUNT_STATE_TOKEN])
	static selectTwoFactorConfigurationStatus(state: AccountStateModel): TwoFactorConfigurationStatus {
		return state.twoFactorConfigurationStatus;
	}

	@Action(Dash.SetUserProfileDetails)
	setUserProfile(ctx: StateContext<AccountStateModel>, action: Dash.SetUserProfileDetails): void {
		ctx.setState(
			produce((draft: AccountStateModel) => {
				draft.email = action.paylaod.email;
				draft.emailConfirmed = action.paylaod.emailConfirmed;
				draft.externalLogins = action.paylaod.externalLogins;
				draft.hasAuthenticator = action.paylaod.hasAuthenticator;
				draft.recoveryCodesLeft = action.paylaod.recoveryCodesLeft;
				draft.twoFactorClientRemembered = action.paylaod.twoFactorClientRemembered;
				draft.twoFactorEnabled = action.paylaod.twoFactorEnabled;
				draft.twoFactorConfigurationStatus = action.paylaod.twoFactorConfigurationStatus;
			})
		);
	}

	@Action(Dash.UpdateTwoFactorConfigurationStatus)
	twoFactorConfigurationStatusChange(ctx: StateContext<AccountStateModel>, action: Dash.UpdateTwoFactorConfigurationStatus): void {
		ctx.setState(
			produce((draft: AccountStateModel) => {
				draft.twoFactorConfigurationStatus = action.payload;
			})
		);
	}
}
