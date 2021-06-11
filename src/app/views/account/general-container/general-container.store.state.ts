import { StateToken, State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import * as GeneralContainer from './general-container.store.actions';
import produce from 'immer';
import { GeneralContainerStateModel } from './general-container-state.model';
import { AccountGeneralDetails } from 'app/core/models/account/general/account-general-details.model';
import { LogService } from 'app/core/logger/log.service';

const ACCOUNT_GENERAL_STATE_TOKEN = new StateToken<GeneralContainerStateModel>('general');

@State<GeneralContainerStateModel>({
	name: ACCOUNT_GENERAL_STATE_TOKEN,
	defaults: {
		email: '',
		verified: false,
		changeEmailRequestSent: false
	}
})
@Injectable()
/**
 * Provides state for user account general tab.
 */
export class AccountGeneralState {
	/**
	 * Selects account general settings.
	 * @param state
	 * @returns account general details
	 */
	@Selector([ACCOUNT_GENERAL_STATE_TOKEN])
	static selectAccountGeneralDetails(state: GeneralContainerStateModel): AccountGeneralDetails {
		return state as AccountGeneralDetails;
	}

	/**
	 * Selects whether user's request to change email has been successfully sent.
	 * @param state
	 * @returns true if change email request sent was sent successfully
	 */
	@Selector([ACCOUNT_GENERAL_STATE_TOKEN])
	static selectChangeEmailRequestSent(state: GeneralContainerStateModel): boolean {
		return state.changeEmailRequestSent;
	}

	/**
	 * Creates an instance of account general state.
	 * @param _log
	 */
	constructor(private _log: LogService) {}

	/**
	 * Action handler for setting general details settings.
	 * @param ctx
	 * @param action
	 */
	@Action(GeneralContainer.SetAccountGeneralDetails)
	setAccountGeneralDetails(ctx: StateContext<GeneralContainerStateModel>, action: GeneralContainer.SetAccountGeneralDetails): void {
		this._log.info('setAccountGeneralDetails action handler fired.', this);
		ctx.setState(
			produce((draft: GeneralContainerStateModel) => {
				draft = { ...draft, ...action.payload };
				return draft;
			})
		);
	}

	/**
	 * Action handler for whether user's request to change email was sent successfully.
	 * @param ctx
	 * @param action
	 */
	@Action(GeneralContainer.ChangeEmailRequest)
	changeEmailRequestSent(ctx: StateContext<GeneralContainerStateModel>, action: GeneralContainer.ChangeEmailRequest): void {
		this._log.info('changeEmailRequestSent action handler fired.', this);
		ctx.setState(
			produce((draft: GeneralContainerStateModel) => {
				draft = { ...draft, ...action.payload };
				return draft;
			})
		);
	}
}
