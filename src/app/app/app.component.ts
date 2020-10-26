import browser from 'browser-detect';
import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { environment as env } from '../../environments/environment';
import { authLogin, authLogout, routeAnimations, LocalStorageService, selectIsAuthenticated } from '../core/core.module';
import { actionSettingsChangeAnimationsPageDisabled } from '../core/settings/settings.actions';
import { Store as ngxsStore } from '@ngxs/store';
import { SettingsState } from 'app/core/settings/settings.store.state';
import * as Settings from 'app/core/settings/settings.store.actions';
import { LogService } from 'app/core/logger/log.service';
import { Language } from 'app/core/settings/settings.model';
import { MatSelectChange } from '@angular/material/select';

/**
 * AppComponent displays navbar, footer and named router-outlet '#o=outlet'.
 */
@Component({
	selector: 'odm-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
	animations: [routeAnimations]
})
export class AppComponent implements OnInit {
	_isProd = env.production;
	_envName = env.envName;
	_version = env.versions.app as string;
	_year = new Date().getFullYear();
	_logo = (require('../../assets/logo.png') as { default: string }).default;
	_languages = ['en', 'de', 'sk', 'fr', 'es', 'pt-br', 'zh-cn', 'he'];
	_navigation = [
		{ link: 'about', label: 'odm.menu.about' },
		{ link: 'feature-list', label: 'odm.menu.features' },
		{ link: 'examples', label: 'odm.menu.examples' }
	];
	_navigationSideMenu = [...this._navigation, { link: 'settings', label: 'odm.menu.settings' }];

	_isAuthenticated$: Observable<boolean>;
	_stickyHeader$: Observable<boolean>;
	_language$: Observable<string>;
	_theme$: Observable<string>;

	constructor(private store: Store, private storageService: LocalStorageService, private ngxsStore: ngxsStore, private log: LogService) {}

	private static isIEorEdgeOrSafari() {
		return ['ie', 'edge', 'safari'].includes(browser().name);
	}

	ngOnInit(): void {
		this.storageService.testLocalStorage();

		if (AppComponent.isIEorEdgeOrSafari()) {
			this.store.dispatch(
				actionSettingsChangeAnimationsPageDisabled({
					pageAnimationsDisabled: true
				})
			);
		}

		this._isAuthenticated$ = this.store.pipe(select(selectIsAuthenticated));
		this._stickyHeader$ = this.ngxsStore.select(SettingsState.selectStickyHeaderSettings);
		this._language$ = this.ngxsStore.select(SettingsState.selectLanguageSettings);
		this._theme$ = this.ngxsStore.select(SettingsState.selectEffectiveTheme);
	}

	onLoginClick(): void {
		this.store.dispatch(authLogin());
	}

	onLogoutClick(): void {
		this.store.dispatch(authLogout());
	}

	/**
	 * Language select handler for nav bar language selection.
	 * @param MatSelectChange
	 */
	onLanguageSelect(event: MatSelectChange): void {
		this.log.debug(`onLanguageSelect handler fired with: ${event.value as Language}.`, this);
		const languageSelected = { language: event.value as Language };
		this.ngxsStore.dispatch(new Settings.ChangeLanguage(languageSelected));
	}
}
