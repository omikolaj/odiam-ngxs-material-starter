import { Injectable } from '@angular/core';
import { Store, Select } from '@ngxs/store';
import * as Settings from 'app/core/settings/settings.store.actions';
import { AuthState } from './core/auth/auth.store.state';
import { SettingsState } from 'app/core/settings/settings.store.state';
import { Observable } from 'rxjs';
import { Language } from './core/settings/settings-state.model';
import { AuthService } from './core/auth/auth.service';

/**
 * App facade service.
 */
@Injectable({
	providedIn: 'root'
})
export class AppFacadeService {
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
	 * Creates an instance of app facade service.
	 * @param authService
	 * @param store
	 */
	constructor(private authService: AuthService, private store: Store) {}

	/**
	 * Signs user out of the application.
	 */
	signOut(): void {
		this.authService.signUserOut$().subscribe();
	}

	/**
	 * Disables page animations.
	 */
	disablePageAnimations(): void {
		this.store.dispatch(new Settings.ChangeAnimationsPageDisabled({ pageAnimationsDisabled: true }));
	}

	/**
	 * Changes language of the web page.
	 * @param languageSelected
	 */
	changeLanguage(languageSelected: string): void {
		this.store.dispatch(new Settings.ChangeLanguage({ language: languageSelected as Language }));
	}
}
