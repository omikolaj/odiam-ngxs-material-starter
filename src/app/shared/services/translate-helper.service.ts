import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LogService } from 'app/core/logger/log.service';

/**
 * Translate service helper.
 */
@Injectable({
	providedIn: 'root'
})
export class TranslateHelperService {
	/**
	 * Creates an instance of translate service helper service.
	 * @param _translateService
	 * @param _log
	 */
	constructor(private _translationService: TranslateService, private _log: LogService) {}

	/**
	 * Determines whether translation key exists.
	 * @param key
	 * @returns true if translation
	 */
	hasTranslation(key: string): boolean {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const translation = this._translationService.instant(key);
		const exists = translation !== key && translation !== '';
		if (exists) {
			this._log.info('[hasTranslation]: Translation key exists.', this);
		} else {
			this._log.error('[hasTranslation]: Translation key does not exist.', this, key);
		}
		return exists;
	}
}
