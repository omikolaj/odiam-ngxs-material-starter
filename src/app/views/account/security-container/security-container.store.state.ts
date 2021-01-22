import { StateToken, State, Action, StateContext, Selector } from '@ngxs/store';
import { SecurityContainerStateModel } from './security-container-state.model';
import { Injectable } from '@angular/core';
import * as SecurityContainer from './security-container.store.actions';
import produce from 'immer';
import { AccountSecurityDetails } from 'app/core/models/account-security-details.model';

const ACCOUNT_SECURITY_STATE_TOKEN = new StateToken<SecurityContainerStateModel>('security');

@State<SecurityContainerStateModel>({
	name: ACCOUNT_SECURITY_STATE_TOKEN,
	defaults: {
		hasAuthenticator: false,
		recoveryCodes: {
			items: []
		},
		recoveryCodesLeft: 0,
		twoFactorEnabled: false
	}
})
@Injectable()
/**
 * Provides state for user account security tab.
 */
export class AccountSecurityState {
	/**
	 * Selects security details.
	 * @param state
	 * @returns security details
	 */
	@Selector([ACCOUNT_SECURITY_STATE_TOKEN])
	static selectAccountSecurityDetails(state: SecurityContainerStateModel): AccountSecurityDetails {
		return state as AccountSecurityDetails;
	}

	/**
	 * Action handler for setting account security details state.
	 * @param ctx
	 * @param action
	 */
	@Action(SecurityContainer.SetAccountSecurityDetails)
	setAccountSecurityDetails(ctx: StateContext<SecurityContainerStateModel>, action: SecurityContainer.SetAccountSecurityDetails): void {
		ctx.setState(
			produce((draft: SecurityContainerStateModel) => {
				draft = { ...draft, ...action.payload };
				return draft;
			})
		);
	}

	/**
	 * Actions handler that updates two factor authentication settings
	 * @param ctx
	 * @param action
	 */
	@Action(SecurityContainer.UpdateAccountSecurityDetailsSettings)
	updateAccountSecurityDetailsSetting(
		ctx: StateContext<SecurityContainerStateModel>,
		action: SecurityContainer.UpdateAccountSecurityDetailsSettings
	): void {
		ctx.setState(
			produce((draft: SecurityContainerStateModel) => {
				draft = {
					...action.payload,
					recoveryCodes: {
						items: [...action.payload.recoveryCodes.items]
					}
				};
				return draft;
			})
		);
	}

	/**
	 * Actions handler that updates recovery codes.
	 * @param ctx
	 * @param action
	 */
	@Action(SecurityContainer.UpdateRecoveryCodes)
	updateUserRecoveryCodes(ctx: StateContext<SecurityContainerStateModel>, action: SecurityContainer.UpdateRecoveryCodes): void {
		ctx.setState(
			produce((draft: SecurityContainerStateModel) => {
				draft.recoveryCodes = action.payload;
				draft.recoveryCodesLeft = action.payload.items.length;
				return draft;
			})
		);
	}

	/**
	 * Actions handler that resets account security settings.
	 * @param ctx
	 * @param action
	 */
	@Action(SecurityContainer.ResetAccountSecuritySettings)
	resetAccountSecuritySettings(ctx: StateContext<SecurityContainerStateModel>): void {
		const defaults: SecurityContainerStateModel = {
			hasAuthenticator: false,
			recoveryCodes: {
				items: []
			},
			recoveryCodesLeft: 0,
			twoFactorEnabled: false
		};
		ctx.setState(
			produce((draft: SecurityContainerStateModel) => {
				draft = defaults;
				return draft;
			})
		);
	}
}
