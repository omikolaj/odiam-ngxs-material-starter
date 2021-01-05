import { StateToken, State, Action, StateContext, Selector } from '@ngxs/store';
import { AccountSecurityStateModel } from './account-security-state-model';
import { Injectable } from '@angular/core';
import * as AccountSecurity from './account-security.store.actions';
import produce from 'immer';
import { AccountSecurityDetails } from 'app/core/models/account-security-details.model';

const ACCOUNT_SECURITY_STATE_TOKEN = new StateToken<AccountSecurityStateModel>('security');

@State<AccountSecurityStateModel>({
	name: ACCOUNT_SECURITY_STATE_TOKEN,
	defaults: {
		externalLogins: [],
		hasAuthenticator: false,
		recoveryCodes: [],
		recoveryCodesLeft: 0,
		twoFactorEnabled: false
	}
})
@Injectable()
/**
 * Providers state for user account security tab.
 */
export class AccountSecurityState {
	/**
	 * Selects security details.
	 * @param state
	 * @returns security details
	 */
	@Selector([ACCOUNT_SECURITY_STATE_TOKEN])
	static selectAccountSecurityDetails(state: AccountSecurityStateModel): AccountSecurityStateModel {
		return state as AccountSecurityDetails;
	}

	/**
	 * Action handler for initialzing account security details state.
	 * @param ctx
	 * @param action
	 */
	@Action(AccountSecurity.SetAccountSecurityDetails)
	setAccountSecurityDetails(ctx: StateContext<AccountSecurityStateModel>, action: AccountSecurity.SetAccountSecurityDetails): void {
		ctx.setState(
			produce((draft: AccountSecurityStateModel) => {
				draft = { ...draft, ...action.payload };
				return draft;
			})
		);
	}
}
