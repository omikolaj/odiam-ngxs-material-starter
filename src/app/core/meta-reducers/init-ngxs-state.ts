import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, Optional, PLATFORM_ID } from '@angular/core';
import { REQUEST } from '@nguniversal/express-engine/tokens';
import { TranslateService } from '@ngx-translate/core';
import { getActionTypeFromInstance, NgxsNextPluginFn, NgxsPlugin } from '@ngxs/store';
import { LogService } from 'app/core/logger/log.service';
import { SettingsStateModel } from 'app/core/settings/settings-state.model';
import { Request } from 'express';
import { TranslateCacheService } from 'ngx-translate-cache';
import { LocalStorageService } from './../local-storage/local-storage.service';

@Injectable({
	providedIn: 'root'
})
export class InitNgxsState implements NgxsPlugin {
	/**
	 * Represents the initial action dispatched by NGXS when first initialized.
	 * NGXS dispatches this event when store is being initialized, before all the ngxsOnInit Life-cycle events.
	 */
	private readonly INIT = '@@INIT';

	/**
	 *
	 */
	constructor(
		private _translateService: TranslateService,
		private _translateCacheService: TranslateCacheService,
		@Optional() @Inject(REQUEST) private _req: Request,
		// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
		@Inject(PLATFORM_ID) private _platform: any,
		private _log: LogService,
		private _localStorageService: LocalStorageService
	) {}

	handle(state: any, action: any, next: NgxsNextPluginFn) {
		if ([this.INIT].includes(getActionTypeFromInstance(action))) {
			let browserLang;
			if (isPlatformBrowser(this._platform)) {
				this._log.info('Platform is [Browser].');
				this._log.info('Getting state from local storage.', this);
				const initialState = this._localStorageService.loadInitialState();
				this._log.info('Initial state from localStorage: ', this, initialState);

				this._log.info('Getting current language setting.', this);
				browserLang = this._translateCacheService.getCachedLanguage() || this._translateService.getBrowserLang() || 'en';
				this._log.info('browserLang is: ', this, browserLang);

				if (initialState['settings'] as SettingsStateModel) {
					(initialState['settings'] as SettingsStateModel).language = browserLang || 'en';
				}

				state = { ...state, ...initialState };
			} else {
				this._log.info('Platform is [Server].');

				this._log.info('Getting current language setting from cookies.', this);
				browserLang = this._getLangFromServerSideCookie() || 'en';
				this._log.info('browserLang is: ', this, browserLang);

				const settingsState: SettingsStateModel = { ...state['settings'] };
				settingsState.language = browserLang;

				state = { ...state, settings: { ...settingsState } };
			}
		}
		return next(state, action);
	}

	/**
	 * Tries to retrieve language from the cookies on request object for SSR.
	 */
	private _getLangFromServerSideCookie(): string {
		this._log.info('The exeucting platform is [Server].', this);
		if (this._req) {
			if (this._req.cookies) {
				this._log.info('Node request object is truthy. Extracting `lang` property from cookies.', this);
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
				return this._req.cookies['lang'] as string;
			}
		}
		this._log.info('Node request object is falsy. Returning empty string for `lang`.', this);
		return '';
	}
}
