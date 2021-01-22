import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ROUTE_ANIMATIONS_ELEMENTS } from '../../../core/core.module';
import { Store } from '@ngxs/store';
import * as Settings from 'app/core/settings/settings.store.actions';
import { LogService } from 'app/core/logger/log.service';
import { SettingsState } from 'app/core/settings/settings.store.state';
import { tap } from 'rxjs/operators';
import { MatSelectChange } from '@angular/material/select';
import { Language, SettingsStateModel } from 'app/core/settings/settings-state.model';
import { MatSlideToggle } from '@angular/material/slide-toggle';

/**
 * Component that contains the settings view.
 */
@Component({
	selector: 'odm-settings',
	templateUrl: './settings-container.component.html',
	styleUrls: ['./settings-container.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsContainerComponent implements OnInit {
	_routeAnimationsElements = ROUTE_ANIMATIONS_ELEMENTS;
	_settings$: Observable<SettingsStateModel>;
	_themes = [
		{ value: 'DEFAULT-THEME', label: 'blue' },
		{ value: 'LIGHT-THEME', label: 'light' },
		{ value: 'NATURE-THEME', label: 'nature' },
		{ value: 'BLACK-THEME', label: 'dark' }
	];
	_languages = [
		{ value: 'en', label: 'English' },
		{ value: 'de', label: 'Deutsch' },
		{ value: 'sk', label: 'Slovenčina' },
		{ value: 'fr', label: 'Français' },
		{ value: 'es', label: 'Español' },
		{ value: 'pt-br', label: 'Português' },
		{ value: 'zh-cn', label: '简体中文' },
		{ value: 'he', label: 'עברית' }
	];

	/**
	 * Creates an instance of settings container component.
	 * @param store
	 * @param log
	 */
	constructor(private store: Store, private logger: LogService) {}

	/**
	 * NgOnInit life cycle.
	 */
	ngOnInit(): void {
		this.logger.trace('Initialized.', this);
		this._settings$ = this.store.select(SettingsState.selectSettings).pipe(tap((settings) => this.logger.trace('Settings data.', this, settings)));
	}

	/**
	 * Event handler for language selection change.
	 * @param event
	 */
	onLanguageSelect(event: MatSelectChange): void {
		this.logger.debug(`onLanguageSelect handler fired with: ${event.value as Language}.`, this);
		const languageSelected = { language: event.value as Language };
		this.store.dispatch(new Settings.ChangeLanguage(languageSelected));
	}

	/**
	 * Event handler for theme selection change.
	 * @param event
	 */
	onThemeSelect(event: MatSelectChange): void {
		this.logger.debug(`onThemeSelect handler fired with: ${event.value as string}.`, this);
		const themeSelected = { theme: event.value as string };
		this.store.dispatch(new Settings.ChangeTheme(themeSelected));
	}

	/**
	 * Event handler for auto night mode toggle.
	 * @param event
	 */
	onAutoNightModeToggle(event: MatSlideToggle): void {
		this.logger.debug(`onAutoNightModeToggle handler fired with: ${String(event.checked)}.`, this);
		const autoNightModeToggle = { autoNightMode: event.checked };
		this.store.dispatch(new Settings.ChangeAutoNightMode(autoNightModeToggle));
	}

	/**
	 * Event handler for sticky header toggle.
	 * @param event
	 */
	onStickyHeaderToggle(event: MatSlideToggle): void {
		this.logger.debug(`onStickyHeaderToggle handler fired with: ${String(event.checked)}.`, this);
		const stickyHeaderToggle = { stickyHeader: event.checked };
		this.store.dispatch(new Settings.ChangeStickyHeader(stickyHeaderToggle));
	}

	/**
	 * Event handler for page animations toggle.
	 * @param event
	 */
	onPageAnimationsToggle(event: MatSlideToggle): void {
		this.logger.debug(`onPageAnimationsToggle handler fired with: ${String(event.checked)}.`, this);
		const pageAnimationToggle = { pageAnimations: event.checked };
		this.store.dispatch(new Settings.ChangeAnimationsPage(pageAnimationToggle));
	}

	/**
	 * Event handler for elements animations toggle.
	 * @param event
	 */
	onElementsAnimationsToggle(event: MatSlideToggle): void {
		this.logger.debug(`onElementsAnimationsToggle handler fired with: ${String(event.checked)}.`, this);
		const elementsAnimationsToggle = { elementsAnimations: event.checked };
		this.store.dispatch(new Settings.ChangeAnimationsElements(elementsAnimationsToggle));
	}
}
