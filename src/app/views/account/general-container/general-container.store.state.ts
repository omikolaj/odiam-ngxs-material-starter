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
		emailChangeCompleted: false
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
	 * Selects whether email change had completed without errors.
	 * @param state
	 * @returns email change completed
	 */
	@Selector([ACCOUNT_GENERAL_STATE_TOKEN])
	static selectEmailChangeCompleted(state: GeneralContainerStateModel): boolean {
		return state.emailChangeCompleted;
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
	 * Actions handler that updates state whether user's email change request completed without errors.
	 * @param ctx
	 * @param action
	 */
	@Action(GeneralContainer.EmailChangeCompleted)
	emailChangeCompleted(ctx: StateContext<GeneralContainerStateModel>, action: GeneralContainer.EmailChangeCompleted): void {
		this._log.info('emailChangeCompleted action handler fired.', this);
		ctx.setState(
			produce((draft: GeneralContainerStateModel) => {
				draft = { ...draft, ...action.payload };
				return draft;
			})
		);
	}
}
