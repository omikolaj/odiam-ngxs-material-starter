import { Language, SettingsStateModel } from 'app/core/settings/settings-state.model';

/**
 * Init settings state from local storage.
 */
export class InitStateFromLocalStorage {
	/**
	 * Type of action.
	 */
	static readonly type = '[Settings] Init Settings from Local Storage';
	constructor() {}
}

/**
 * Change language setting.
 */
export class ChangeLanguage {
	/**
	 * Type of action.
	 */
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
	/**
	 * Type of action.
	 */
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
	/**
	 * Type of action.
	 */
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
	/**
	 * Type of action.
	 */
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
	/**
	 * Type of action.
	 */
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
	/**
	 * Type of action.
	 */
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
	/**
	 * Type of action.
	 */
	static readonly type = '[Settings] Change Animations Elements';

	/**
	 * Creates an instance of change animations elements action.
	 * @param payload
	 */
	constructor(public payload: { elementsAnimations: boolean }) {}
}

/**
 * Update route animation type.
 */
export class UpdateRouteAnimationType {
	/**
	 * Type of action.
	 */
	static readonly type = '[Settings] Update Route Animation Type';
}

/**
 * Change hour setting.
 */
export class ChangeHour {
	/**
	 * Type of action.
	 */
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
	/**
	 * Type of action.
	 */
	static readonly type = '[Settings] Persist Settings';

	/**
	 * Creates an instance of persist settings action.
	 * @param payload
	 */
	constructor(public payload: SettingsStateModel) {}
}

/**
 * Set default translation language.
 */
export class SetTranslateLanguage {
	/**
	 * Type of action.
	 */
	static readonly type = '[Settings] Set Transalte Langauge';
	constructor() {}
}

/**
 * Set default page title.
 */
export class SetTitle {
	/**
	 * Type of action.
	 */
	static readonly type = '[Settings] Set Title';
	constructor() {}
}
