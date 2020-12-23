import { StateToken, State, Action, StateContext, Selector } from '@ngxs/store';
import { DashboardStateModel } from './dashboard-state-model';
import { Injectable } from '@angular/core';
import * as Dash from './dashboard.store.actions';
import produce from 'immer';
import { UserProfileDetails } from 'app/core/models/user-profile-details.model';

const DASHBOARD_STATE_TOKEN = new StateToken<DashboardStateModel>('dashboard');

@State<DashboardStateModel>({
	name: DASHBOARD_STATE_TOKEN,
	defaults: {
		email: '',
		emailConfirmed: false,
		externalLogins: [],
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
	@Selector([DASHBOARD_STATE_TOKEN])
	static selectUserProfileDetails(state: DashboardStateModel): UserProfileDetails {
		return state;
	}

	@Selector([DASHBOARD_STATE_TOKEN])
	static selectHasAuthenticator(state: DashboardStateModel): boolean {
		return state.hasAuthenticator;
	}

	@Selector([DASHBOARD_STATE_TOKEN])
	static selectHasTwoFactorEnabled(state: DashboardStateModel): boolean {
		return state.twoFactorEnabled;
	}

	@Action(Dash.SetUserProfileDetails)
	setUserProfile(ctx: StateContext<DashboardStateModel>, action: Dash.SetUserProfileDetails): void {
		ctx.setState(
			produce((draft: DashboardStateModel) => {
				draft.email = action.paylaod.email;
				draft.emailConfirmed = action.paylaod.emailConfirmed;
				draft.externalLogins = action.paylaod.externalLogins;
				draft.hasAuthenticator = action.paylaod.hasAuthenticator;
				draft.recoveryCodesLeft = action.paylaod.recoveryCodesLeft;
				draft.twoFactorClientRemembered = action.paylaod.twoFactorClientRemembered;
				draft.twoFactorEnabled = action.paylaod.twoFactorClientRemembered;
			})
		);
	}
}