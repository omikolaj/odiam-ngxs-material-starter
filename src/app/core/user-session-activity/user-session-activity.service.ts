import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { Observable, timer, Subject } from 'rxjs';
import { add, isBefore } from 'date-fns';
import { map, startWith, repeatWhen, takeUntil } from 'rxjs/operators';
import { LocalStorageService } from '../core.module';
import { LogService } from '../logger/log.service';
import { ACTIVE_UNTIL } from './user-session-activity-key';

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
	private _userInactivityTimeoutInSeconds = 5;

	/**
	 * Time in miliseconds, that determines how often to check if user is inactive.
	 */
	private _checkActivityIntervalInMs = 5000;

	/**
	 * Renderer of user session activity service.
	 */
	private _renderer: Renderer2;

	/**
	 * Unlistens to mousemove event.
	 */
	private _unlistenMouseMove: () => void;

	/**
	 * Unlistens to scroll event.
	 */
	private _unlistenScroll: () => void;

	/**
	 * Unlisten keydown event.
	 */
	private _unlistenKeydown: () => void;

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
	 * @param localStorageService
	 * @param log
	 */
	constructor(rendererFactory: RendererFactory2, private localStorageService: LocalStorageService, private log: LogService) {
		// renderer 2 https://stackoverflow.com/questions/44989666/service-no-provider-for-renderer2
		this._renderer = rendererFactory.createRenderer(null, null);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		this._eventHandler = this._updateActiveUntilTime.bind(this);
	}

	/**
	 * Monitors user session activity.
	 * @returns if user is active
	 */
	monitorUserSessionActivity$(): Observable<boolean> {
		this.log.trace('monitorUserSessionActivity$ fired.', this);
		this._tracker();
		return this._isUserActive$().pipe(startWith(true));
	}

	/**
	 * Starts activity timer.
	 */
	startActivityTimer(): void {
		this.log.trace('startActivityTimer executed.', this);
		this._start.next();
	}

	/**
	 * Stops activity timer.
	 */
	stopActivityTimer(): void {
		this.log.trace('stopActivityTimer executed.', this);
		this._stop.next();
	}

	/**
	 * Cleans up 'mousemove', 'scroll' and 'keydown' events from the page.
	 */
	cleanUp(): void {
		this.log.trace('cleanUp executed.', this);
		this._unlistenFromMouseMove();
		this._unlistenFromKeyDown();
		this._unlistenFromScroll();
	}

	/**
	 * Unlistens from mouse move event.
	 */
	private _unlistenFromMouseMove(): void {
		try {
			this.log.debug("Unlistening 'mousemove' event.", this);
			this._unlistenMouseMove();
		} catch (error) {
			this.log.error("Error occured when unlistening 'mousemove'.", this, error);
		}
	}

	/**
	 * Unlistens from key down event.
	 */
	private _unlistenFromKeyDown(): void {
		try {
			this.log.debug("Unlistening 'keydown' event.", this);
			this._unlistenKeydown();
		} catch (error) {
			this.log.error("Error occured when unlistening 'keydown'.", this, error);
		}
	}

	/**
	 * Unlistens from scroll event.
	 */
	private _unlistenFromScroll(): void {
		try {
			this.log.debug("Unlistening 'scroll' event.", this);
			this._unlistenScroll();
		} catch (error) {
			this.log.error("Error occured when unlistening 'scroll'.", this, error);
		}
	}

	/**
	 * Whether user is active on the page.
	 * @returns if user is active
	 */
	private _isUserActive$(): Observable<boolean> {
		// set the initial ACTIVE_UNTIL time in local storage.
		this._updateActiveUntilTime();
		return timer(this._checkActivityIntervalInMs).pipe(
			takeUntil(this._stop),
			map(() => {
				const expiredTime = parseInt(this.localStorageService.getItem(ACTIVE_UNTIL), 10);
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
			this.log.trace('Updating ACTIVE_UNTIL value.', this);
			this.localStorageService.setItem(ACTIVE_UNTIL, add(new Date(), { seconds: this._userInactivityTimeoutInSeconds }).getTime());
		}, 300);
	}

	/**
	 * Hooks up event listeners for 'mousemove', 'scroll' and 'keydown'. These events track user's activity on the page.
	 */
	private _tracker(): void {
		this.log.debug("Listening for 'mousemove' event.", this);
		this._unlistenMouseMove = this._renderer.listen('window', 'mousemove', this._eventHandler);
		this.log.debug("Listening for 'keydown' event.", this);
		this._unlistenKeydown = this._renderer.listen('window', 'keydown', this._eventHandler);
		this.log.debug("Listening for 'scroll' event.", this);
		this._unlistenScroll = this._renderer.listen('window', 'scroll', this._eventHandler);
	}
}
