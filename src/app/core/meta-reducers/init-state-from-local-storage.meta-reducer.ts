import { getActionTypeFromInstance } from '@ngxs/store';
import { LocalStorageService } from '../core.module';

const INIT = '@@INIT';

export function initStateFromLocalStorage(state, action, next): any {
	if ([INIT].includes(getActionTypeFromInstance(action))) {
		state = { ...state, ...LocalStorageService.loadInitialState() };
	}
	return next(state, action);
}
