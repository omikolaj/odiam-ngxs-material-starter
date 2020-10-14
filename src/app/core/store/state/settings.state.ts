import { Injectable } from '@angular/core';
import { Action, Actions, NgxsAfterBootstrap, NgxsOnInit, ofAction, Selector, State, StateContext, StateToken } from '@ngxs/store';
import { Settings } from '../actions/settings.actions';
import { LocalStorageService } from '../../../core/local-storage/local-storage.service';
import produce from 'immer';
import { DEFAULT_THEME, NIGHT_MODE_THEME, SETTINGS_KEY, UserSettings } from './user-settings.model';

export interface SettingsStateModel {
  settings: UserSettings;
}

export const SETTINGS_STATE_TOKEN = new StateToken<SettingsStateModel>('settings');

@State<SettingsStateModel>({
  name: SETTINGS_STATE_TOKEN,
  defaults: {
    settings: {
      language: 'en',
      theme: DEFAULT_THEME,
      autoNightMode: false,
      nightTheme: NIGHT_MODE_THEME,
      stickyHeader: true,
      pageAnimations: true,
      pageAnimationsDisabled: false,
      elementsAnimations: true,
      hour: 0
    }
  }
})
@Injectable()
export class SettingsState implements NgxsAfterBootstrap {
  constructor(private localStorageService: LocalStorageService) {}

  ngxsAfterBootstrap(ctx: StateContext<SettingsStateModel>) {
    ctx.dispatch(new Settings.InitStateFromLocalStorage());
  }

  @Selector([SETTINGS_STATE_TOKEN])
  static selectLanguageSettings(state: SettingsStateModel): string {
    return state.settings.language;
  }

  @Action(Settings.InitStateFromLocalStorage)
  initFromLocalStorage(ctx: StateContext<SettingsStateModel>) {
    ctx.setState(
      produce((draft: SettingsStateModel) => {
        return { ...draft, ...LocalStorageService.loadInitialState() };
      })
    );
  }

  @Action(Settings.ChangeLanguage)
  changeLanguage(ctx: StateContext<SettingsStateModel>, action: Settings.ChangeLanguage) {
    ctx.setState(
      produce((draft: SettingsStateModel) => {
        draft.settings = { ...draft.settings, ...action.payload };
      })
    );
    const settings = ctx.getState().settings;
    console.log('change language dispatched', settings);
    return ctx.dispatch(new Settings.PersistSettings(settings));
  }

  @Action(Settings.ChangeTheme)
  changeTheme(ctx: StateContext<SettingsStateModel>, action: Settings.ChangeTheme) {
    ctx.setState(
      produce((draft: SettingsStateModel) => {
        draft.settings = { ...draft.settings, ...action.payload };
      })
    );
    const settings = ctx.getState().settings;
    return ctx.dispatch(new Settings.PersistSettings(settings));
  }

  @Action(Settings.ChangeAutoNightMode)
  changeAutoNightMode(ctx: StateContext<SettingsStateModel>, action: Settings.ChangeAutoNightMode) {
    ctx.setState(
      produce((draft: SettingsStateModel) => {
        draft.settings = { ...draft.settings, ...action.payload };
      })
    );
    const settings = ctx.getState().settings;
    return ctx.dispatch(new Settings.PersistSettings(settings));
  }

  @Action(Settings.ChangeHour)
  changeHour(ctx: StateContext<SettingsStateModel>, action: Settings.ChangeHour) {
    ctx.setState(
      produce((draft: SettingsStateModel) => {
        draft.settings = { ...draft.settings, ...action.payload };
      })
    );
    const settings = ctx.getState().settings;
    return ctx.dispatch(new Settings.PersistSettings(settings));
  }

  @Action(Settings.ChangeAnimationsPage)
  changeAnimationsPage(ctx: StateContext<SettingsStateModel>, action: Settings.ChangeAnimationsPage) {
    ctx.setState(
      produce((draft: SettingsStateModel) => {
        draft.settings = { ...draft.settings, ...action.payload };
      })
    );
    const settings = ctx.getState().settings;
    return ctx.dispatch(new Settings.PersistSettings(settings));
  }

  @Action(Settings.ChangeAnimationsElements)
  changeAnimationsElements(ctx: StateContext<SettingsStateModel>, action: Settings.ChangeAnimationsElements) {
    ctx.setState(
      produce((draft: SettingsStateModel) => {
        draft.settings = { ...draft.settings, ...action.payload };
      })
    );
    const settings = ctx.getState().settings;
    return ctx.dispatch(new Settings.PersistSettings(settings));
  }

  @Action(Settings.ChangeAnimationsPageDisabled)
  changeAnimationsPageDisabled(ctx: StateContext<SettingsStateModel>, action: Settings.ChangeAnimationsPageDisabled) {
    ctx.setState(
      produce((draft: SettingsStateModel) => {
        draft.settings = { ...draft.settings, ...action.payload };
        draft.settings.pageAnimations = false;
      })
    );
    const settings = ctx.getState().settings;
    return ctx.dispatch(new Settings.PersistSettings(settings));
  }

  @Action(Settings.PersistSettings)
  persistSettings(ctx: StateContext<SettingsStateModel>, action: Settings.PersistSettings) {
    this.localStorageService.setItem(SETTINGS_KEY, action.payload);
  }
}
