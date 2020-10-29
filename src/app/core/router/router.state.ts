import { Params } from '@angular/router';

/**
 * Router state url model.
 */
export interface RouterStateUrl {
	/**
	 *  Current route url.
	 */
	url: string;

	/**
	 * Any param values the route had.
	 */
	params: Params;

	/**
	 * Any query param values the route had.
	 */
	queryParams: Params;
}
