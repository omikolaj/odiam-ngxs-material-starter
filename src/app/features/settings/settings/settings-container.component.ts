import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ROUTE_ANIMATIONS_ELEMENTS } from '../../../core/core.module';
import {
  actionSettingsChangeAnimationsElements,
  actionSettingsChangeAnimationsPage,
  actionSettingsChangeAutoNightMode,
  actionSettingsChangeLanguage,
  actionSettingsChangeTheme,
  actionSettingsChangeStickyHeader
} from '../../../core/settings/settings.actions';
import { SettingsState, State } from '../../../core/settings/settings.model';
import { selectSettings } from '../../../core/settings/settings.selectors';
import { Store as ngxsStore } from '@ngxs/store';
import { Settings } from '../../../core/store/actions/settings.actions';

@Component({
  selector: 'odm-settings',
  templateUrl: './settings-container.component.html',
  styleUrls: ['./settings-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsContainerComponent implements OnInit {
  routeAnimationsElements = ROUTE_ANIMATIONS_ELEMENTS;
  settings$: Observable<SettingsState>;

  themes = [
    { value: 'DEFAULT-THEME', label: 'blue' },
    { value: 'LIGHT-THEME', label: 'light' },
    { value: 'NATURE-THEME', label: 'nature' },
    { value: 'BLACK-THEME', label: 'dark' }
  ];

  languages = [
    { value: 'en', label: 'English' },
    { value: 'de', label: 'Deutsch' },
    { value: 'sk', label: 'Slovenčina' },
    { value: 'fr', label: 'Français' },
    { value: 'es', label: 'Español' },
    { value: 'pt-br', label: 'Português' },
    { value: 'zh-cn', label: '简体中文' },
    { value: 'he', label: 'עברית' }
  ];

  constructor(private store: Store<State>, private ngxsStore: ngxsStore) {}

  ngOnInit() {
    this.settings$ = this.store.pipe(select(selectSettings));
  }

  onLanguageSelect({ value: language }) {
    //this.store.dispatch(actionSettingsChangeLanguage({ language }));
    this.ngxsStore.dispatch(new Settings.ChangeLanguage({ language }));
  }

  onThemeSelect({ value: theme }) {
    this.store.dispatch(actionSettingsChangeTheme({ theme }));
    //this.ngxsStore.dispatch(new Settings.ChangeTheme({ theme }))
  }

  onAutoNightModeToggle({ checked: autoNightMode }) {
    this.store.dispatch(actionSettingsChangeAutoNightMode({ autoNightMode }));
  }

  onStickyHeaderToggle({ checked: stickyHeader }) {
    this.store.dispatch(actionSettingsChangeStickyHeader({ stickyHeader }));
  }

  onPageAnimationsToggle({ checked: pageAnimations }) {
    this.store.dispatch(actionSettingsChangeAnimationsPage({ pageAnimations }));
  }

  onElementsAnimationsToggle({ checked: elementsAnimations }) {
    this.store.dispatch(actionSettingsChangeAnimationsElements({ elementsAnimations }));
  }
}
