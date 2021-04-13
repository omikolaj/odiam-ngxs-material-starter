import { Injectable } from '@angular/core';

/**
 * Animations service.
 */
@Injectable({
	providedIn: 'root'
})
export class AnimationsService {
	constructor() {
		AnimationsService._routeAnimationType = 'NONE';
	}

	/**
	 * Route animation type.
	 */
	private static _routeAnimationType: RouteAnimationType = 'NONE';

	/**
	 * Determines whetherthe set route animations type is same as the one passed in. Used by route.animations.ts file.
	 * @param type
	 * @returns true if route animations type.
	 */
	static isRouteAnimationsType(type: RouteAnimationType): boolean {
		return AnimationsService._routeAnimationType === type;
	}

	/**
	 * Updates route animation type.
	 * @param pageAnimations
	 * @param elementsAnimations
	 */
	updateRouteAnimationType(pageAnimations: boolean, elementsAnimations: boolean): void {
		AnimationsService._routeAnimationType =
			pageAnimations && elementsAnimations ? 'ALL' : pageAnimations ? 'PAGE' : elementsAnimations ? 'ELEMENTS' : 'NONE';
	}
}

/**
 * Defines route animation types.
 */
export type RouteAnimationType = 'ALL' | 'PAGE' | 'ELEMENTS' | 'NONE';
