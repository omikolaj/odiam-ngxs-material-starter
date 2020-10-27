export const NIGHT_MODE_THEME = 'BLACK-THEME';
export const DEFAULT_THEME = 'DEFAULT-THEME';

/**
 * Language type for all available languages for the app.
 */
export type Language = 'en' | 'sk' | 'de' | 'fr' | 'es' | 'pt-br' | 'he';

/**
 * Key used as a key for user settings object when persisting to local storage.
 */
export const SETTINGS_KEY = 'SETTINGS';

/**
 * User settings model.
 */
export interface UserSettings {
	language: string;
	theme: string;
	autoNightMode: boolean;
	nightTheme: string;
	stickyHeader: boolean;
	pageAnimations: boolean;
	pageAnimationsDisabled: boolean;
	elementsAnimations: boolean;
	hour: number;
}

/**
 * Settings state model for ngxs store.
 */
export interface SettingsStateModel {
	settings: UserSettings;
}
