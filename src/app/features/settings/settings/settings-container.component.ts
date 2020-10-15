import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { ROUTE_ANIMATIONS_ELEMENTS } from '../../../core/core.module';
import { Store } from '@ngxs/store';
import { UserSettings } from 'app/core/settings/settings.model';
import { tap } from 'rxjs/operators';
import { SettingsState } from 'app/core/settings/settings.store.state';
import { Settings } from 'app/core/settings/settings.store.actions';

@Component({
  selector: 'odm-settings',
  templateUrl: './settings-container.component.html',
  styleUrls: ['./settings-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsContainerComponent implements OnInit {
  routeAnimationsElements = ROUTE_ANIMATIONS_ELEMENTS;
  settings$: Observable<UserSettings>;

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

  constructor(private store: Store) {}

  ngOnInit() {
    this.settings$ = this.store.select(SettingsState.selectSettings);
  }

  onLanguageSelect({ value: language }) {
    this.store.dispatch(new Settings.ChangeLanguage({ language }));
  }

  onThemeSelect({ value: theme }) {
    this.store.dispatch(new Settings.ChangeTheme({ theme }));
  }

  onAutoNightModeToggle({ checked: autoNightMode }) {
    this.store.dispatch(new Settings.ChangeAutoNightMode({ autoNightMode }));
  }

  onStickyHeaderToggle({ checked: stickyHeader }) {
    this.store.dispatch(new Settings.ChangeStickyHeader({ stickyHeader }));
  }

  onPageAnimationsToggle({ checked: pageAnimations }) {
    this.store.dispatch(new Settings.ChangeAnimationsPage({ pageAnimations }));
  }

  onElementsAnimationsToggle({ checked: elementsAnimations }) {
    this.store.dispatch(new Settings.ChangeAnimationsElements({ elementsAnimations }));
  }
}
