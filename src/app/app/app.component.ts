import browser from 'browser-detect';
import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';

import { environment as env } from '../../environments/environment';

import {
  authLogin,
  authLogout,
  routeAnimations,
  LocalStorageService,
  selectIsAuthenticated,
  selectSettingsStickyHeader,
  selectSettingsLanguage,
  selectEffectiveTheme
} from '../core/core.module';
import { actionSettingsChangeAnimationsPageDisabled, actionSettingsChangeLanguage } from '../core/settings/settings.actions';
import { Store as ngxsStore } from '@ngxs/store';
import { SettingsState } from 'app/core/settings/settings.store.state';
import { tap } from 'rxjs/operators';
import { Settings } from 'app/core/settings/settings.store.actions';

@Component({
  selector: 'odm-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [routeAnimations]
})
export class AppComponent implements OnInit {
  isProd = env.production;
  envName = env.envName;
  version = env.versions.app;
  year = new Date().getFullYear();
  logo = require('../../assets/logo.png').default;
  languages = ['en', 'de', 'sk', 'fr', 'es', 'pt-br', 'zh-cn', 'he'];
  navigation = [
    { link: 'about', label: 'odm.menu.about' },
    { link: 'feature-list', label: 'odm.menu.features' },
    { link: 'examples', label: 'odm.menu.examples' }
  ];
  navigationSideMenu = [...this.navigation, { link: 'settings', label: 'odm.menu.settings' }];

  isAuthenticated$: Observable<boolean>;
  stickyHeader$: Observable<boolean>;
  language$: Observable<string>;
  theme$: Observable<string>;

  constructor(private store: Store, private storageService: LocalStorageService, private ngxsStore: ngxsStore) {}

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

    this.isAuthenticated$ = this.store.pipe(select(selectIsAuthenticated));
    // this.stickyHeader$ = this.store.pipe(select(selectSettingsStickyHeader));
    this.stickyHeader$ = this.ngxsStore.select(SettingsState.selectStickyHeaderSettings);
    this.language$ = this.ngxsStore.select(SettingsState.selectLanguageSettings);
    //this.theme$ = this.store.pipe(select(selectEffectiveTheme), tap(theme => console.log('theme is', theme)));
    this.theme$ = this.ngxsStore.select(SettingsState.selectEffectiveTheme).pipe(tap((theme) => console.log('theme: ', theme)));
  }

  onLoginClick() {
    this.store.dispatch(authLogin());
  }

  onLogoutClick() {
    this.store.dispatch(authLogout());
  }

  onLanguageSelect({ value: language }) {
    this.ngxsStore.dispatch(new Settings.ChangeLanguage({ language }));
    //this.store.dispatch(actionSettingsChangeLanguage({ language }));
  }
}
