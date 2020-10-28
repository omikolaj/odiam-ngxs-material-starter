import { ActionReducer, INIT as INITRX, UPDATE } from '@ngrx/store';

import { AppState } from '../core.state';

export function initStateFromLocalStorageNgrx(reducer: ActionReducer<AppState>): ActionReducer<AppState> {
	return function (state, action) {
		const newState = reducer(state, action);
		if ([INITRX.toString(), UPDATE.toString()].includes(action.type)) {
			// return { ...newState, ...LocalStorageService.loadInitialState() };
		}
		return newState;
	};
}
