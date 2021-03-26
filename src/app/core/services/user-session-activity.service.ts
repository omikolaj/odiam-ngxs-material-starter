import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

import { interval, BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/internal/operators/take';
import { tap } from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class UserSessionActivityService {
	timeoutTracker;
	onTimeout: () => void;
	eventHandler;
	interval;
	timeout;

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
		this.timeout = 10;

		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		this.eventHandler = this._updateExiredTime.bind(this);
		this._tracker();
		this._setInterval();
	}

	private _setInterval(): void {
		this._updateExiredTime();
		const expiredTime = parseInt(localStorage.getItem('_expiredTime'), 10);
		interval(1000)
			.pipe(
				take(1),
				tap(() => {
					if (expiredTime < Date.now()) {
						this._isUserActive.next(false);
					} else {
						this._isUserActive.next(true);
					}
				})
			)
			.subscribe();

		// this.interval = setInterval(() => {
		// 	const expiredTime = parseInt(localStorage.getItem('_expiredTime'), 10);
		// 	if (expiredTime < Date.now()) {
		// 		if (this.onTimeout) {
		// 			this.onTimeout();
		// 			this._cleanUp();
		// 		}
		// 	}
		// }, 1000);
	}

	private _updateExiredTime(): void {
		if (this.timeoutTracker) {
			clearTimeout(this.timeoutTracker);
		}
		this.timeoutTracker = setTimeout(() => {
			localStorage.setItem('expiredTime', (Date.now() + this.timeout * 1000).toString());
		}, 300);
	}

	private _tracker(): void {
		this.unlistenMouseMove = this.renderer.listen('window', 'mousemove', this.eventHandler);
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
