import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Inject, NgModule, Optional, PLATFORM_ID } from '@angular/core';
import { BrowserTransferStateModule, TransferState } from '@angular/platform-browser';
import { REQUEST } from '@nguniversal/express-engine/tokens';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { LogService } from 'app/core/logger/log.service';
import { Request } from 'express';
import { TranslateCacheModule, TranslateCacheService, TranslateCacheSettings } from 'ngx-translate-cache';
import { translateLoaderFactory } from './translate-loader';

/**
 * I18n ng module.
 */
@NgModule({
	imports: [
		HttpClientModule,
		BrowserTransferStateModule,
		TranslateModule.forRoot({
			loader: {
				provide: TranslateLoader,
				useFactory: translateLoaderFactory,
				deps: [HttpClient, TransferState, LogService, PLATFORM_ID]
			}
		}),
		TranslateCacheModule.forRoot({
			cacheService: {
				provide: TranslateCacheService,
				useFactory: translateCacheFactory,
				deps: [TranslateService, TranslateCacheSettings]
			},
			cacheMechanism: 'Cookie'
		})
	],
	exports: [TranslateModule]
})
export class I18nModule {
	/**
	 * Creates an instance of i18n module.
	 * @param translateService
	 * @param translateCacheService
	 * @param _log
	 * @param _req
	 * @param platform
	 */
	constructor(
		translateCacheService: TranslateCacheService,
		private _log: LogService,
		@Optional() @Inject(REQUEST) private _req: Request,
		// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
		@Inject(PLATFORM_ID) platform: any
	) {
		if (isPlatformBrowser(platform)) {
			this._log.info('The executing platform is [Browser].', this);
			this._log.info('Initializing TranslateCacheService.', this);
			translateCacheService.init();
		}
	}

	/**
	 * Tries to retrieve language from the cookies on request object for SSR.
	 */
	getLangFromServerSideCookie(): string {
		this._log.info('The exeucting platform is [Server].', this);
		if (this._req) {
			this._log.info('Node request object is truthy. Extracting `lang` property from cookies.', this);
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			return this._req.cookies['lang'] as string;
		}
		this._log.info('Node request object is falsy. Returning empty string for `lang`.', this);
		return '';
	}
}

/**
 * @description Sets the selected language from client side cookie.
 * @param translateService
 * @param translateCacheSettings
 * @returns TranslateCacheService.
 */
export function translateCacheFactory(translateService: TranslateService, translateCacheSettings: TranslateCacheSettings): TranslateCacheService {
	return new TranslateCacheService(translateService, translateCacheSettings);
}
