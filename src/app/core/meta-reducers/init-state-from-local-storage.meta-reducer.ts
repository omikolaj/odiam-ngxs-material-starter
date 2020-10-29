import { getActionTypeFromInstance } from '@ngxs/store';
import { LocalStorageService } from '../core.module';

/**
 * Represents the initial action dispatched by NGXS when first initialized.
 */
const INIT = '@@INIT';

/**
 * Inits state from local storage when action type is @@INIT
 * @param state
 * @param action
 * @param next
 * @returns updated state.
 */
export function initStateFromLocalStorage(state: any, action: any, next: any): any {
	if ([INIT].includes(getActionTypeFromInstance(action))) {
		state = { ...state, ...LocalStorageService.loadInitialState() };
	}
	return next(state, action);
}
