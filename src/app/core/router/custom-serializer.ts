import { Injectable } from '@angular/core';
import { RouterStateSnapshot } from '@angular/router';
import { RouterStateUrl } from './router.state';
import { RouterStateSerializer } from '@ngxs/router-plugin';

/**
 * Serializes route state and stores in the ngxs store.
 */
@Injectable()
export class CustomSerializer implements RouterStateSerializer<RouterStateUrl> {
	/**
	 * Serializes route state.
	 * @param routerState
	 * @returns serialized route state that is then stored in the store.
	 */
	serialize(routerState: RouterStateSnapshot): RouterStateUrl {
		const {
			url,
			root: { queryParams }
		} = routerState;

		let { root: route } = routerState;
		while (route.firstChild) {
			route = route.firstChild;
		}

		const { params } = route;

		return { url, params, queryParams };
	}
}
