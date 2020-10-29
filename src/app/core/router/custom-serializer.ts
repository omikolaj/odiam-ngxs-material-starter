import { Injectable } from '@angular/core';
import { RouterStateSnapshot } from '@angular/router';
import { RouterStateUrl } from './router.state';
import { RouterStateSerializer } from '@ngxs/router-plugin';

@Injectable()
export class CustomSerializer implements RouterStateSerializer<RouterStateUrl> {
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
