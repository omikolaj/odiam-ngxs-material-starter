import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Language, SettingsStateModel } from 'app/core/settings/settings-state.model';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ROUTE_ANIMATIONS_ELEMENTS } from '../../../core/core.module';
import { SettingsSandboxService } from '../settings-sandbox.service';

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
	/**
	 * Route animations
	 */
	readonly _routeAnimationsElements = ROUTE_ANIMATIONS_ELEMENTS;
	/**
	 * Settings state.
	 */
	_settings$: Observable<SettingsStateModel>;
	/**
	 * Supported themes.
	 */
	readonly _themes = [
		{ value: 'DEFAULT-THEME', label: 'blue' },
		{ value: 'LIGHT-THEME', label: 'light' },
		{ value: 'NATURE-THEME', label: 'nature' },
		{ value: 'BLACK-THEME', label: 'dark' }
	];

	/**
	 * Supported languages.
	 */
	readonly _languages = [
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
	 * @param _sb
	 */
	constructor(private _sb: SettingsSandboxService) {}

	/**
	 * NgOnInit life cycle.
	 */
	ngOnInit(): void {
		this._sb.log.trace('Initialized.', this);
		this._settings$ = this._sb.settings$.pipe(tap((settings) => this._sb.log.trace('[ngOnInit]: Settings data.', this, settings)));
	}

	/**
	 * NgOnDestroy life cycle.
	 */
	ngOnDestroy(): void {
		this._sb.log.trace('Destroyed.', this);
	}

	/**
	 * Event handler for language selection change.
	 * @param event
	 */
	_onLanguageSelectChanged(event: MatSelectChange): void {
		this._sb.log.trace(`onLanguageSelect handler fired with: ${event.value as Language}.`, this);
		const languageSelected = { language: event.value as Language };
		this._sb.onLanguageSelected(languageSelected);
	}

	/**
	 * Event handler for theme selection change.
	 * @param event
	 */
	_onThemeSelectChanged(event: MatSelectChange): void {
		this._sb.log.trace(`onThemeSelect handler fired with: ${event.value as string}.`, this);
		const themeSelected = { theme: event.value as string };
		this._sb.onThemeSelected(themeSelected);
	}

	/**
	 * Event handler for auto night mode toggle.
	 * @param event
	 */
	_onAutoNightModeToggleChanged(event: MatSlideToggleChange): void {
		this._sb.log.trace(`onAutoNightModeToggle handler fired with: ${String(event.checked)}.`, this);
		const autoNightModeToggle = { autoNightMode: event.checked };
		this._sb.onAutoNightModeToggle(autoNightModeToggle);
	}

	/**
	 * Event handler for sticky header toggle.
	 * @param event
	 */
	_onStickyHeaderToggleChanged(event: MatSlideToggleChange): void {
		this._sb.log.trace(`onStickyHeaderToggle handler fired with: ${String(event.checked)}.`, this);
		const stickyHeaderToggle = { stickyHeader: event.checked };
		this._sb.onStickyHeaderToggle(stickyHeaderToggle);
	}

	/**
	 * Event handler for page animations toggle.
	 * @param event
	 */
	_onPageAnimationsToggleChanged(event: MatSlideToggleChange): void {
		this._sb.log.trace(`onPageAnimationsToggle handler fired with: ${String(event.checked)}.`, this);
		const pageAnimationsToggle = { pageAnimations: event.checked };
		this._sb.onPageAnimationsToggle(pageAnimationsToggle);
	}

	/**
	 * Event handler for elements animations toggle.
	 * @param event
	 */
	_onElementsAnimationsToggleChanged(event: MatSlideToggleChange): void {
		this._sb.log.trace(`onElementsAnimationsToggle handler fired with: ${String(event.checked)}.`, this);
		const elementsAnimationsToggle = { elementsAnimations: event.checked };
		this._sb.onElementsAnimationsToggle(elementsAnimationsToggle);
	}
}
