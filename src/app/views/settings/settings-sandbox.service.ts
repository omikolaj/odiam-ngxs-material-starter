import { Injectable } from '@angular/core';
import { Store, Select } from '@ngxs/store';
import { LogService } from 'app/core/logger/log.service';
import { SettingsStateModel, Language } from 'app/core/settings/settings-state.model';
import { SettingsState } from 'app/core/settings/settings.store.state';
import { Observable } from 'rxjs';
import * as Settings from 'app/core/settings/settings.store.actions';

/**
 * Settings sandbox service.
 */
@Injectable()
export class SettingsSandboxService {
	@Select(SettingsState.selectSettings) settings$: Observable<SettingsStateModel>;

	/**
	 * Creates an instance of settings sandbox service.
	 * @param _store
	 * @param log
	 */
	constructor(private _store: Store, public log: LogService) {}

	/**
	 * Updates current language setting.
	 * @param languageSelected
	 */
	onLanguageSelected(languageSelected: { language: Language }): void {
		this._store.dispatch(new Settings.ChangeLanguage(languageSelected));
	}

	/**
	 * Updates current theme setting.
	 * @param themeSelected
	 */
	onThemeSelected(themeSelected: { theme: string }): void {
		this._store.dispatch(new Settings.ChangeTheme(themeSelected));
	}

	/**
	 * Updates auto night mode setting.
	 * @param autoNightModeToggle
	 */
	onAutoNightModeToggle(autoNightModeToggle: { autoNightMode: boolean }): void {
		this._store.dispatch(new Settings.ChangeAutoNightMode(autoNightModeToggle));
	}

	/**
	 * Updates sticky header setting.
	 * @param stickyHeaderToggle
	 */
	onStickyHeaderToggle(stickyHeaderToggle: { stickyHeader: boolean }): void {
		this._store.dispatch(new Settings.ChangeStickyHeader(stickyHeaderToggle));
	}

	/**
	 * Updates page animation setting.
	 * @param pageAnimationToggle
	 */
	onPageAnimationsToggle(pageAnimationsToggle: { pageAnimations: boolean }): void {
		this._store.dispatch(new Settings.ChangeAnimationsPage(pageAnimationsToggle));
	}

	/**
	 * Updates elements animations setting.
	 * @param elementsAnimationsToggle
	 */
	onElementsAnimationsToggle(elementsAnimationsToggle: { elementsAnimations: boolean }): void {
		this._store.dispatch(new Settings.ChangeAnimationsElements(elementsAnimationsToggle));
	}
}
