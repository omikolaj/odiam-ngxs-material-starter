import { Language } from 'app/core/settings/settings.model';
import { UserSettings } from '../state/settings.model';

export namespace Settings {
  export class InitStateFromLocalStorage {
    static readonly type = '[Settings] Init Settings from Local Storage';
    constructor() {}
  }

  export class ChangeLanguage {
    static readonly type = '[Settings] Change Language';
    constructor(public payload: { language: Language }) {}
  }

  export class ChangeTheme {
    static readonly type = '[Settings] Change Theme';
    constructor(public payload: { theme: string }) {}
  }

  export class ChangeAutoNightMode {
    static readonly type = '[Settings] Change Auto Night Mode';
    constructor(public payload: { autoNightMode: boolean }) {}
  }

  export class ChangeStickyHeader {
    static readonly type = '[Settings] Change Sticky Header';
    constructor(public payload: { stickyHeader: boolean }) {}
  }

  export class ChangeAnimationsPage {
    static readonly type = '[Settings] Change Animations Page';
    constructor(public payload: { pageAnimations: boolean }) {}
  }

  export class ChangeAnimationsPageDisabled {
    static readonly type = '[Settings] Change Animations Page Disabled';
    constructor(public payload: { pageAnimationsDisabled: boolean }) {}
  }

  export class ChangeAnimationsElements {
    static readonly type = '[Settings] Change Animations Elements';
    constructor(public payload: { elementsAnimations: boolean }) {}
  }

  export class ChangeHour {
    static readonly type = '[Settings] Change Hours';
    constructor(public payload: { hour: number }) {}
  }

  export class PersistSettings {
    static readonly type = '[Settings] Persist Settings';
    constructor(public payload: UserSettings) {}
  }

  export class SetTranslateLanguage {
    static readonly type = '[Settings] Set Transalte Langauge';
    constructor() {}
  }

  export class SetTitle {
    static readonly type = '[Settings] Set Title';
    constructor() {}
  }
}
