import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { LogService } from 'app/core/logger/log.service';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Observable, of } from 'rxjs';

// We use a require syntax because this file might only be available during compilation.
// https://indepth.dev/posts/1047/implementing-multi-language-angular-applications-rendered-on-server
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const i18nMap = require('../../assets/i18n/autogen/map.json');

/**
 * Translate browser loader.
 */
export class TranslateBrowserLoader implements TranslateLoader {
	/**
	 * Creates an instance of translate browser loader.
	 * @param transferState
	 * @param http
	 * @param [prefix]
	 * @param [suffix]
	 */
	constructor(
		private _transferState: TransferState,
		private _http: HttpClient,
		private _log: LogService,
		private _prefix: string = './assets/i18n/',
		private _suffix: string = '.json'
	) {}

	/**
	 * Gets translation when executing in the browser.
	 * @param lang
	 * @returns translation
	 */
	getTranslation(lang: string): Observable<any> {
		this._log.info('[getTranslation] executing. Platform is [Browser].');
		const key = makeStateKey<any>('transfer-translate-' + lang);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const data = this._transferState.get(key, null);
		this._log.info('Data retrieved from state: ', this, data);
		this._log.info('i18n', this, i18nMap);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		const language = (i18nMap[lang] as string) || '';

		this._log.info(`Selected language is [${lang}]. Setting language hash from autogen/map.json file to: `, this, language);
		const suffix = `.${language}${this._suffix}`;
		this._log.info('Suffix has been set to: ', this, suffix);

		// First we are looking for the translations in transfer-state, if none found, http load as fallback
		return data ? of(data) : new TranslateHttpLoader(this._http, this._prefix, suffix).getTranslation(lang);
	}
}

/**
 * Translate fsloader for server platform.
 */
export class TranslateFSLoader implements TranslateLoader {
	/**
	 * Creates an instance of translate fs loader. Used to load translations when platform is set to server side.
	 * @param _transferState
	 * @param _log
	 * @param [prefix]
	 * @param [suffix]
	 */
	constructor(private _transferState: TransferState, private _log: LogService, private _prefix = './assets/i18n', private _suffix = '.json') {}

	/**
	 * Gets the translations from the server, store them in the transfer state
	 */
	getTranslation(lang: string): Observable<any> {
		this._log.info('[getTranslation] executing. Platform is [Server].');
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		const language = (i18nMap[lang] as string) || '';
		const path = join(__dirname, '../browser', this._prefix, `${lang}.${language}${this._suffix}`);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const data = JSON.parse(readFileSync(path, 'utf8'));
		const key = makeStateKey<any>('transfer-translate-' + lang);
		this._transferState.set(key, data);

		return of(data);
	}
}

/**
 * @description Translates loader factory
 * @param httpClient
 * @param transferState
 * @param log
 * @param platform
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function translateLoaderFactory(httpClient: HttpClient, transferState: TransferState, log: LogService, platform: any): TranslateLoader {
	const prefix = './assets/i18n/autogen/';
	return isPlatformBrowser(platform)
		? new TranslateBrowserLoader(transferState, httpClient, log, prefix)
		: new TranslateFSLoader(transferState, log, prefix);
}
