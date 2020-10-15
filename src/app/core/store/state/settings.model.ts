export const NIGHT_MODE_THEME = 'BLACK-THEME';
export const DEFAULT_THEME = 'DEFAULT-THEME';

export type Language = 'en' | 'sk' | 'de' | 'fr' | 'es' | 'pt-br' | 'he';

export const SETTINGS_KEY = 'SETTINGS';

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
