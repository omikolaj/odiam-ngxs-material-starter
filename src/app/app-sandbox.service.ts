import { Injectable } from '@angular/core';
import { Store, Select } from '@ngxs/store';
import * as Settings from 'app/core/settings/settings.store.actions';
import { AuthState } from './core/auth/auth.store.state';
import { SettingsState } from 'app/core/settings/settings.store.state';
import { Observable } from 'rxjs';
import { Language } from './core/settings/settings-state.model';
import { AuthService } from './core/auth/auth.service';
import { LogService } from './core/logger/log.service';
import { LocalStorageService } from './core/core.module';

/**
 * App sandbox service.
 */
@Injectable()
export class AppSandboxService {
	/**
	 * Selects whether user is authenticated.
	 */
	@Select(AuthState.selectIsAuthenticated) isAuthenticated$: Observable<boolean>;

	/**
	 * Selects whether stick header has been configured.
	 */
	@Select(SettingsState.selectStickyHeaderSettings) stickyHeader$: Observable<boolean>;

	/**
	 * Selects currenty selected language.
	 */
	@Select(SettingsState.selectLanguageSettings) language$: Observable<string>;

	/**
	 * Selects current theme.
	 */
	@Select(SettingsState.selectEffectiveTheme) theme$: Observable<string>;

	/**
	 * Creates an instance of app sandbox service.
	 * @param _authService
	 * @param _store
	 * @param _storageService
	 * @param log
	 */
	constructor(private _authService: AuthService, private _store: Store, private _storageService: LocalStorageService, public log: LogService) {}

	/**
	 * Signs user out of the application.
	 */
	signOut(): void {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call
		this._authService.signUserOut$().subscribe();
	}

	/**
	 * Tests that localStorage exists, can be written to, and read from.
	 */
	testLocalStorage(): void {
		this._storageService.testLocalStorage();
	}

	/**
	 * Disables page animations.
	 */
	disablePageAnimations(): void {
		this._store.dispatch(new Settings.ChangeAnimationsPageDisabled({ pageAnimationsDisabled: true }));
	}

	/**
	 * Changes language of the web page.
	 * @param languageSelected
	 */
	changeLanguage(languageSelected: string): void {
		this._store.dispatch(new Settings.ChangeLanguage({ language: languageSelected as Language }));
	}
}
