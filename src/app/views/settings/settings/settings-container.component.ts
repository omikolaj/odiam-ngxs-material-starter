import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { ROUTE_ANIMATIONS_ELEMENTS } from '../../../core/core.module';
import { tap } from 'rxjs/operators';
import { MatSelectChange } from '@angular/material/select';
import { Language, SettingsStateModel } from 'app/core/settings/settings-state.model';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { SettingsFacadeService } from '../settings-facade.service';

/**
 * Component that contains the settings view.
 */
@Component({
	selector: 'odm-settings',
	templateUrl: './settings-container.component.html',
	styleUrls: ['./settings-container.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsContainerComponent implements OnInit, OnDestroy {
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
	 */
	constructor(private facade: SettingsFacadeService) {}

	/**
	 * NgOnInit life cycle.
	 */
	ngOnInit(): void {
		this.facade.log.trace('Initialized.', this);
		this._settings$ = this.facade.settings$.pipe(tap((settings) => this.facade.log.trace('Settings data.', this, settings)));
	}

	/**
	 * NgOnDestroy life cycle.
	 */
	ngOnDestroy(): void {
		this.facade.log.trace('Destroyed.', this);
	}

	/**
	 * Event handler for language selection change.
	 * @param event
	 */
	_onLanguageSelect(event: MatSelectChange): void {
		this.facade.log.trace(`onLanguageSelect handler fired with: ${event.value as Language}.`, this);
		const languageSelected = { language: event.value as Language };
		this.facade.onLanguageSelected(languageSelected);
	}

	/**
	 * Event handler for theme selection change.
	 * @param event
	 */
	_onThemeSelect(event: MatSelectChange): void {
		this.facade.log.trace(`onThemeSelect handler fired with: ${event.value as string}.`, this);
		const themeSelected = { theme: event.value as string };
		this.facade.onThemeSelected(themeSelected);
	}

	/**
	 * Event handler for auto night mode toggle.
	 * @param event
	 */
	_onAutoNightModeToggle(event: MatSlideToggle): void {
		this.facade.log.trace(`onAutoNightModeToggle handler fired with: ${String(event.checked)}.`, this);
		const autoNightModeToggle = { autoNightMode: event.checked };
		this.facade.onAutoNightModeToggle(autoNightModeToggle);
	}

	/**
	 * Event handler for sticky header toggle.
	 * @param event
	 */
	_onStickyHeaderToggle(event: MatSlideToggle): void {
		this.facade.log.trace(`onStickyHeaderToggle handler fired with: ${String(event.checked)}.`, this);
		const stickyHeaderToggle = { stickyHeader: event.checked };
		this.facade.onStickyHeaderToggle(stickyHeaderToggle);
	}

	/**
	 * Event handler for page animations toggle.
	 * @param event
	 */
	_onPageAnimationsToggle(event: MatSlideToggle): void {
		this.facade.log.trace(`onPageAnimationsToggle handler fired with: ${String(event.checked)}.`, this);
		const pageAnimationsToggle = { pageAnimations: event.checked };
		this.facade.onPageAnimationsToggle(pageAnimationsToggle);
	}

	/**
	 * Event handler for elements animations toggle.
	 * @param event
	 */
	_onElementsAnimationsToggle(event: MatSlideToggle): void {
		this.facade.log.trace(`onElementsAnimationsToggle handler fired with: ${String(event.checked)}.`, this);
		const elementsAnimationsToggle = { elementsAnimations: event.checked };
		this.facade.onElementsAnimationsToggle(elementsAnimationsToggle);
	}
}
