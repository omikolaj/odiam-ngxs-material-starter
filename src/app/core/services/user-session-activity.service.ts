import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

import { BehaviorSubject, Observable, interval } from 'rxjs';

import { add, isBefore } from 'date-fns';
import { map, startWith } from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class UserSessionActivityService {
	timeoutTracker;
	onTimeout: () => void;
	eventHandler;
	interval;
	timeout;

	skipInterval = false;

	private renderer: Renderer2;

	unlistenMouseMove: () => void;
	unlistenScroll: () => void;
	unlistenKeydown: () => void;

	private _isUserActive = new BehaviorSubject<boolean>(true);
	isUserActive$ = this._isUserActive.asObservable();

	// sample https://codesandbox.io/s/interesting-snowflake-ml9w9?from-embed=&file=/src/app/IdleTimer.js
	constructor(rendererFactory: RendererFactory2) {
		// renderer 2 https://stackoverflow.com/questions/44989666/service-no-provider-for-renderer2
		this.renderer = rendererFactory.createRenderer(null, null);

		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		// this.onTimeout = this.authService.signOutUser.bind(this);
		this.timeout = 7;

		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		this.eventHandler = this._updateExiredTime.bind(this);
		this._tracker();
		// this.setInterval();
	}

	private _setInterval$(): Observable<boolean> {
		this._updateExiredTime();

		return interval(5000).pipe(
			startWith(0),
			map(() => {
				const expiredTime = parseInt(localStorage.getItem('expiredTime'), 10);
				const isUserActive = !isBefore(expiredTime, Date.now());

				if (isUserActive) {
					// console.log('isUserActive: true');
					// this._isUserActive.next(true);
					return true;
				} else {
					// console.log('isUserActive: false');
					// this._isUserActive.next(false);
					return false;
				}
			})
		);

		// this.interval = (() => {
		// 	// const expiredTime = parseInt(localStorage.getItem('_expiredTime'), 10);
		// 	const expiredTime = parseInt(localStorage.getItem('expiredTime'), 10);
		// 	const isUserActive = !isBefore(expiredTime, Date.now());

		// 	if (isUserActive) {
		// 		console.log('isUserActive: true');
		// 		this._isUserActive.next(true);
		// 	} else {
		// 		console.log('isUserActive: false');
		// 		this._isUserActive.next(false);
		// 	}
		// }, 3000);
	}

	monitorUserSessionActivity$(): Observable<boolean> {
		return this._setInterval$().pipe(startWith(true));
	}

	private _updateExiredTime(): void {
		if (this.timeoutTracker) {
			clearTimeout(this.timeoutTracker);
		}
		this.timeoutTracker = setTimeout(() => {
			localStorage.setItem('expiredTime', add(new Date(), { seconds: this.timeout }).getTime().toString());
		}, 300);
	}

	private _tracker(): void {
		this.unlistenMouseMove = this.renderer.listen('window', 'mousemove', () => {
			console.log('updating expired time');
			this.eventHandler();
		});
		this.unlistenScroll = this.renderer.listen('window', 'scroll', this.eventHandler);
		this.unlistenKeydown = this.renderer.listen('window', 'keydown', this.eventHandler);
	}

	private _cleanUp(): void {
		clearInterval(this.interval);
		this.unlistenMouseMove();
		this.unlistenKeydown();
		this.unlistenScroll();
	}
}

// import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

// import { Observable, interval } from 'rxjs';

// import { add, isBefore } from 'date-fns';
// import { map, startWith } from 'rxjs/operators';
// import { LocalStorageService } from '../core.module';
// import { LogService } from '../logger/log.service';

// @Injectable({
// 	providedIn: 'root'
// })
// export class UserSessionActivityService {
// 	/**
// 	 * Timeout tracker that is used to offset the number of writes to local storage.
// 	 */
// 	private _timeoutTracker: NodeJS.Timeout;

// 	/**
// 	 * Interval timeout of how often a check should be made to see if user's session is still active.
// 	 */
// 	private _timeout = 5000;

// 	/**
// 	 * Renderer of user session activity service.
// 	 */
// 	private renderer: Renderer2;

// 	/**
// 	 * Unlistens to mousemove event.
// 	 */
// 	private _unlistenMouseMove: () => void;

// 	/**
// 	 * Unlistens to scroll event.
// 	 */
// 	private _unlistenScroll: () => void;

// 	/**
// 	 * Unlisten keydown event.
// 	 */
// 	private _unlistenKeydown: () => void;

// 	// sample https://codesandbox.io/s/interesting-snowflake-ml9w9?from-embed=&file=/src/app/IdleTimer.js
// 	/**
// 	 * Creates an instance of user session activity service.
// 	 * @param rendererFactory
// 	 * @param localStorageService
// 	 */
// 	constructor(rendererFactory: RendererFactory2, private localStorageService: LocalStorageService, private log: LogService) {
// 		// renderer 2 https://stackoverflow.com/questions/44989666/service-no-provider-for-renderer2
// 		this.renderer = rendererFactory.createRenderer(null, null);
// 	}

// 	/**
// 	 * Emits user is active values.
// 	 * @returns interval
// 	 */
// 	private _isUserActive$(): Observable<boolean> {
// 		// this._updateExiredTime();

// 		return interval(this._timeout).pipe(
// 			map(() => {
// 				const expiredTime = parseInt(this.localStorageService.getItem('expiredTime'), 10);
// 				return !isBefore(expiredTime, Date.now());
// 			})
// 		);
// 	}

// 	/**
// 	 * Monitors user session activity
// 	 * @returns whether user is active or not
// 	 */
// 	monitorUserSessionActivity$(): Observable<boolean> {
// 		this.log.trace('monitorUserSessionActivity$ fired.', this);
// 		// begin tracking user activity
// 		this._tracker();
// 		return this._isUserActive$().pipe(startWith(true));
// 	}

// 	/**
// 	 * Updates the time when the current session will be deemed inactive.
// 	 */
// 	private _updateExiredTime(): void {
// 		console.log('updateExpiredTime');
// 		if (this._timeoutTracker) {
// 			clearTimeout(this._timeoutTracker);
// 		}
// 		this._timeoutTracker = setTimeout(() => {
// 			this.localStorageService.setItem('expiredTime', add(new Date(), { seconds: this._timeout }).getTime().toString());
// 		}, 300);
// 	}

// 	/**
// 	 * Subscribes to mousemove, scroll and keydown events on the current window object.
// 	 */
// 	private _tracker(): void {
// 		this.log.trace('_tracker fired.', this);
// 		this._unlistenMouseMove = this.renderer.listen('window', 'mousemove', this._updateExiredTime.bind(this));
// 		this._unlistenScroll = this.renderer.listen('window', 'scroll', this._updateExiredTime.bind(this));
// 		this._unlistenKeydown = this.renderer.listen('window', 'keydown', this._updateExiredTime.bind(this));
// 	}

// 	/**
// 	 * Cleans up mousemove, scroll and keydown events.
// 	 */
// 	cleanUp(): void {
// 		this.log.trace('cleanUp fired.', this);
// 		this._unlistenMouseMove();
// 		this._unlistenKeydown();
// 		this._unlistenScroll();
// 	}
// }
