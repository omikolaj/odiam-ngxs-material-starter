import { StateToken, State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import * as GeneralContainer from './general-container.store.actions';
import produce from 'immer';
import { GeneralContainerStateModel } from './general-container-state.model';
import { AccountGeneralDetails } from 'app/core/models/account-general-details.model';

const ACCOUNT_GENERAL_STATE_TOKEN = new StateToken<GeneralContainerStateModel>('general');

@State<GeneralContainerStateModel>({
	name: ACCOUNT_GENERAL_STATE_TOKEN,
	defaults: {
		email: '',
		verified: false
	}
})
@Injectable()
/**
 * Provides state for user account general tab.
 */
export class AccountGeneralState {
	@Selector([ACCOUNT_GENERAL_STATE_TOKEN])
	static selectAccountGeneralDetails(state: GeneralContainerStateModel): AccountGeneralDetails {
		return state as AccountGeneralDetails;
	}

	@Action(GeneralContainer.SetAccountGeneralDetails)
	setAccountGeneralDetails(ctx: StateContext<GeneralContainerStateModel>, action: GeneralContainer.SetAccountGeneralDetails): void {
		ctx.setState(
			produce((draft: GeneralContainerStateModel) => {
				draft = { ...draft, ...action.payload };
				return draft;
			})
		);
	}
}
