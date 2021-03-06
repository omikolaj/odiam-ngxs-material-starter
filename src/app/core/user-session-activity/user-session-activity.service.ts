import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { Observable, timer, Subject } from 'rxjs';
import { add, isBefore } from 'date-fns';
import { map, startWith, repeatWhen, takeUntil } from 'rxjs/operators';
import { LocalStorageService } from '../core.module';
import { LogService } from '../logger/log.service';
import { ACTIVE_UNTIL } from './user-session-activity-key';
import AppConfiguration from '../../../assets/app.config.json';
import { AppConfig } from '../models/app-config.model';

/**
 * User session activity service.
 */
@Injectable({
	providedIn: 'root'
})
export class UserSessionActivityService {
	/**
	 * Event handler that updates last user activity timestamp.
	 */
	private _eventHandler: () => void;

	/**
	 * Timeout tracker that is used to offset the number of writes to local storage.
	 */
	private _timeoutTracker: NodeJS.Timeout;

	/**
	 * Time in seconds, that determines how long user must be inactive for, before they are deemed inactive.
	 */
	private readonly _sessionIdleTimeout: number;

	/**
	 * Time in seconds, that determines how often to check if user is inactive.
	 */
	private readonly _checkIfSessionIdleInterval: number;

	/**
	 * Renderer of user session activity service.
	 */
	private readonly _renderer: Renderer2;

	/**
	 * Unlistens to mousemove event.
	 */
	private _unlistenMouseMove: () => void;

	/**
	 * Unlistens to mouse click event.
	 */
	private _unListenMouseClick: () => void;

	/**
	 * Unlistens to scroll event.
	 */
	private _unlistenScroll: () => void;

	/**
	 * Unlisten keydown event.
	 */
	private _unlistenKeydown: () => void;

	/**
	 * Unlisten 'touchmove' event.
	 */
	private _unlistenTouchMove: () => void;

	/**
	 * Start the user session activity timer.
	 */
	private readonly _start = new Subject<void>();

	/**
	 * Stop the user session activity timer.
	 */
	private readonly _stop = new Subject<void>();

	// sample https://codesandbox.io/s/interesting-snowflake-ml9w9?from-embed=&file=/src/app/IdleTimer.js
	/**
	 * Creates an instance of user session activity service.
	 * @param rendererFactory
	 * @param _localStorageService
	 * @param _log
	 */
	constructor(rendererFactory: RendererFactory2, private _localStorageService: LocalStorageService, private _log: LogService) {
		// renderer 2 https://stackoverflow.com/questions/44989666/service-no-provider-for-renderer2
		this._renderer = rendererFactory.createRenderer(null, null);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		this._eventHandler = this._updateActiveUntilTime.bind(this);

		// assign timeout settings
		const appConfig = AppConfiguration as AppConfig;
		const userSessionConfig = appConfig.session;
		this._sessionIdleTimeout = userSessionConfig.sessionIdleTimeout;
		this._checkIfSessionIdleInterval = userSessionConfig.checkIfSessionIdleInterval;
	}

	/**
	 * Monitors user session activity.
	 * @returns if user is active
	 */
	monitorSessionActivity$(): Observable<boolean> {
		this._log.trace('monitorSessionActivity$ fired.', this);
		this._tracker();
		return this._isUserActive$().pipe(startWith(true));
	}

	/**
	 * Starts activity timer.
	 */
	startActivityTimer(): void {
		this._log.verbose('startActivityTimer executed.', this);
		this._start.next();
	}

	/**
	 * Stops activity timer.
	 */
	stopActivityTimer(): void {
		this._log.verbose('stopActivityTimer executed.', this);
		this._stop.next();
	}

	/**
	 * Cleans up 'mousemove', 'scroll' and 'keydown' events from the page.
	 */
	cleanUp(): void {
		this._log.trace('cleanUp executed.', this);
		this._unlistenFromMouseMove();
		this._unlistenFromKeyDown();
		this._unlistenFromScroll();
		this._unlistenFromMouseClick();
		this._unlistenFromTouchMove();
	}

	/**
	 * Unlistens from 'mousemove' event.
	 */
	private _unlistenFromMouseMove(): void {
		try {
			this._log.debug("Unlistening 'mousemove' event.", this);
			if (this._unlistenMouseMove) {
				this._unlistenMouseMove();
			}
		} catch (error) {
			this._log.error("Error occured when unlistening 'mousemove'.", this, error);
		}
	}

	/**
	 * Unlistens from 'touchmove' event.
	 */
	private _unlistenFromTouchMove(): void {
		try {
			this._log.debug("Unlistening 'touchmove' event.", this);
			if (this._unlistenMouseMove) {
				this._unlistenTouchMove();
			}
		} catch (error) {
			this._log.error("Error occured when unlistening 'touchmove'.", this, error);
		}
	}

	/**
	 * Unlistens from key down event.
	 */
	private _unlistenFromKeyDown(): void {
		try {
			this._log.debug("Unlistening 'keydown' event.", this);
			if (this._unlistenKeydown) {
				this._unlistenKeydown();
			}
		} catch (error) {
			this._log.error("Error occured when unlistening 'keydown'.", this, error);
		}
	}

	/**
	 * Unlistens from scroll event.
	 */
	private _unlistenFromScroll(): void {
		try {
			this._log.debug("Unlistening 'scroll' event.", this);
			if (this._unlistenScroll) {
				this._unlistenScroll();
			}
		} catch (error) {
			this._log.error("Error occured when unlistening 'scroll'.", this, error);
		}
	}

	/**
	 * Unlistens from mouse click event.
	 */
	private _unlistenFromMouseClick(): void {
		try {
			this._log.debug("Unlistening 'click' event.", this);
			if (this._unListenMouseClick) {
				this._unListenMouseClick();
			}
		} catch (error) {
			this._log.error("Error occured when unlistening 'click'.", this, error);
		}
	}

	/**
	 * Whether user is active on the page.
	 * @returns if user is active
	 */
	private _isUserActive$(): Observable<boolean> {
		// set the initial ACTIVE_UNTIL time in local storage.
		this._updateActiveUntilTime();
		return timer(this._checkIfSessionIdleInterval * 1000).pipe(
			takeUntil(this._stop),
			map(() => {
				const expiredTime = parseInt(this._localStorageService.getItem(ACTIVE_UNTIL), 10);
				return isBefore(Date.now(), expiredTime);
			}),
			repeatWhen(() => this._start)
		);
	}

	/**
	 * Updates the time when user's session will be considered inactive.
	 */
	private _updateActiveUntilTime(): void {
		if (this._timeoutTracker) {
			clearTimeout(this._timeoutTracker);
		}
		this._timeoutTracker = setTimeout(() => {
			this._log.verbose('Updating ACTIVE_UNTIL value.', this);
			this._localStorageService.setItem(ACTIVE_UNTIL, add(new Date(), { seconds: this._sessionIdleTimeout }).getTime());
		}, 300);
	}

	/**
	 * Hooks up event listeners for 'mousemove', 'scroll' and 'keydown'.
	 * These events track user's activity on the page and are used to determine if user is active/inactive.
	 */
	private _tracker(): void {
		this._log.debug("Listening for 'mousemove' event.", this);
		this._unlistenMouseMove = this._renderer.listen('window', 'mousemove', this._eventHandler);
		this._log.debug("Listening for 'keydown' event.", this);
		this._unlistenKeydown = this._renderer.listen('window', 'keydown', this._eventHandler);
		this._log.debug("Listening for 'scroll' event.", this);
		this._unlistenScroll = this._renderer.listen('window', 'scroll', this._eventHandler);
		this._log.debug("Listening for mouse 'click' event.", this);
		this._unListenMouseClick = this._renderer.listen('window', 'click', this._eventHandler);
		this._log.debug("Listening for 'touchmove' event.", this);
		this._unlistenFromTouchMove = this._renderer.listen('window', 'touchmove', this._eventHandler);
	}
}
