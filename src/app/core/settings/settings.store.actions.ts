import { Language } from 'app/core/settings/settings_1.model';
import { UserSettings } from './settings.model';

/**
 * Init settings state from local storage.
 */
export class InitStateFromLocalStorage {
	static readonly type = '[Settings] Init Settings from Local Storage';
	constructor() {}
}

/**
 * Change language setting.
 */
export class ChangeLanguage {
	static readonly type = '[Settings] Change Language';

	/**
	 * Creates an instance of change language action.
	 * @param payload
	 */
	constructor(public payload: { language: Language }) {}
}

/**
 * Change theme setting.
 */
export class ChangeTheme {
	static readonly type = '[Settings] Change Theme';

	/**
	 * Creates an instance of change theme action.
	 * @param payload
	 */
	constructor(public payload: { theme: string }) {}
}

/**
 * Change auto night mode setting.
 */
export class ChangeAutoNightMode {
	static readonly type = '[Settings] Change Auto Night Mode';

	/**
	 * Creates an instance of change auto night mode action.
	 * @param payload
	 */
	constructor(public payload: { autoNightMode: boolean }) {}
}

/**
 * Change sticky header setting.
 */
export class ChangeStickyHeader {
	static readonly type = '[Settings] Change Sticky Header';

	/**
	 * Creates an instance of change sticky header action.
	 * @param payload
	 */
	constructor(public payload: { stickyHeader: boolean }) {}
}

/**
 * Change animations page setting.
 */
export class ChangeAnimationsPage {
	static readonly type = '[Settings] Change Animations Page';

	/**
	 * Creates an instance of change animations page action.
	 * @param payload
	 */
	constructor(public payload: { pageAnimations: boolean }) {}
}

/**
 * Change animations page disabled setting.
 */
export class ChangeAnimationsPageDisabled {
	static readonly type = '[Settings] Change Animations Page Disabled';

	/**
	 * Creates an instance of change animations page disabled action.
	 * @param payload
	 */
	constructor(public payload: { pageAnimationsDisabled: boolean }) {}
}

/**
 * Change animations elements setting.
 */
export class ChangeAnimationsElements {
	static readonly type = '[Settings] Change Animations Elements';

	/**
	 * Creates an instance of change animations elements action.
	 * @param payload
	 */
	constructor(public payload: { elementsAnimations: boolean }) {}
}

/**
 * Change hour setting.
 */
export class ChangeHour {
	static readonly type = '[Settings] Change Hours';

	/**
	 * Creates an instance of change hour action.
	 * @param payload
	 */
	constructor(public payload: { hour: number }) {}
}

/**
 * Persist settings action.
 */
export class PersistSettings {
	static readonly type = '[Settings] Persist Settings';

	/**
	 * Creates an instance of persist settings action.
	 * @param payload
	 */
	constructor(public payload: UserSettings) {}
}

/**
 * Set default translation language.
 */
export class SetTranslateLanguage {
	static readonly type = '[Settings] Set Transalte Langauge';
	constructor() {}
}

/**
 * Set default page title.
 */
export class SetTitle {
	static readonly type = '[Settings] Set Title';
	constructor() {}
}
