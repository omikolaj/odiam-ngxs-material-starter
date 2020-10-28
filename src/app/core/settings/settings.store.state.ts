import { Router } from '@angular/router';
import { Injectable, NgZone } from '@angular/core';
import { Action, NgxsAfterBootstrap, Selector, State, StateContext, StateToken, NgxsOnInit } from '@ngxs/store';
import { LocalStorageService } from '../local-storage/local-storage.service';
import produce from 'immer';
import { DEFAULT_THEME, NIGHT_MODE_THEME, SETTINGS_KEY, UserSettings, SettingsStateModel } from './settings.model';
import { TranslateService } from '@ngx-translate/core';
import { TitleService } from 'app/core/title/title.service';
import * as Settings from './settings.store.actions';
import { Observable } from 'rxjs';
import { LogService } from '../logger/log.service';

const SETTINGS_STATE_TOKEN = new StateToken<SettingsStateModel>('settings');

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

/**
 * Provides all action handlers and selectors for user settings.
 */
export class SettingsState implements NgxsOnInit, NgxsAfterBootstrap {
	/**
	 * Variable used to store previously set hour for auto night mode.
	 */
	private hour = 0;

	/**
	 * Selects user settings.
	 * @param state
	 * @returns settings
	 */
	@Selector([SETTINGS_STATE_TOKEN])
	static selectSettings(state: SettingsStateModel): UserSettings {
		return state.settings;
	}

	/**
	 * Selects current language setting.
	 * @param state
	 * @returns language settings.
	 */
	@Selector([SETTINGS_STATE_TOKEN])
	static selectLanguageSettings(state: SettingsStateModel): string {
		return state.settings.language;
	}

	/**
	 * Selects sticky header setting.
	 * @param state
	 * @returns sticky header configuration.
	 */
	@Selector([SETTINGS_STATE_TOKEN])
	static selectStickyHeaderSettings(state: SettingsStateModel): boolean {
		return state.settings.stickyHeader;
	}

	/**
	 * Selects current theme based on user selection and current time.
	 * @param state
	 * @param theme currently set theme.
	 * @param nightTheme theme for dark mode.
	 * @param isNightHour rather if its night time.
	 * @returns effective theme.
	 */
	@Selector([SettingsState.selectTheme, SettingsState.selectNightTheme, SettingsState.selectIsNightHour])
	static selectEffectiveTheme(state: SettingsState, theme: string, nightTheme: string, isNightHour: boolean): string {
		return (isNightHour ? nightTheme : theme).toLowerCase();
	}

	/**
	 * Selects current theme.
	 * @param state
	 * @returns theme.
	 */
	@Selector([SETTINGS_STATE_TOKEN])
	private static selectTheme(state: SettingsStateModel): string {
		return state.settings.theme;
	}

	/**
	 * Selects night theme.
	 * @param state
	 * @returns night theme.
	 */
	@Selector([SETTINGS_STATE_TOKEN])
	private static selectNightTheme(state: SettingsStateModel): string {
		return state.settings.nightTheme;
	}

	/**
	 * Selects status of night hour.
	 * @param state
	 * @param autoNightMode true auto night more is enabled.
	 * @param hour current hour.
	 * @returns true if is night hour.
	 */
	@Selector([SettingsState.selectAutoNightMode, SettingsState.selectHour])
	private static selectIsNightHour(state: SettingsState, autoNightMode: string, hour: number): boolean {
		return autoNightMode && (hour >= 21 || hour <= 7);
	}

	/**
	 * Selects status of auto night mode.
	 * @param state
	 * @returns true if auto night mode is enabled.
	 */
	@Selector([SETTINGS_STATE_TOKEN])
	private static selectAutoNightMode(state: SettingsStateModel): boolean {
		return state.settings.autoNightMode;
	}

	/**
	 * Selects hour. Used to determine the effective theme.
	 * @param state
	 * @returns hour.
	 */
	@Selector([SETTINGS_STATE_TOKEN])
	private static selectHour(state: SettingsStateModel): number {
		return state.settings.hour;
	}

	/**
	 * Sets the current hour setting.
	 */
	private changeSetHour = (ctx: StateContext<SettingsStateModel>): void => {
		const hour = new Date().getHours();
		this.log.trace(
			`ngxsOnInit setInterval fired. Hour: ${hour} | prevHour: ${this.hour}. Is hour update required: ${String(hour !== this.hour)}.`,
			this
		);
		if (hour !== this.hour) {
			this.hour = hour;
			const hourToSet = { hour };
			this.log.trace(`ngxsOnInit setInterval dispatching action Settings.ChangeHour with data.`, this, hour);
			this.ngZone.runOutsideAngular(() => ctx.dispatch(new Settings.ChangeHour(hourToSet)));
		}
	};

	/**
	 * Creats settings state instance.
	 * @param localStorageService
	 * @param translateService
	 * @param titleService
	 * @param router
	 */
	constructor(
		private localStorageService: LocalStorageService,
		private translateService: TranslateService,
		private titleService: TitleService,
		private router: Router,
		private log: LogService,
		private ngZone: NgZone
	) {}

	/**
	 * Ngxs on init will be invoked after all states from state's module definition have been initialized and pushed into the state stream.
	 * @param ctx
	 */
	ngxsOnInit(ctx: StateContext<SettingsStateModel>): void {
		this.log.trace('ngxsOnInit invoked.', this);
		this.ngZone.runOutsideAngular(() => {
			// Fire immediately to check what hour it is.
			this.changeSetHour(ctx);

			// Set interval function to check if hour has changed every minute.
			setInterval(this.changeSetHour, 60_000, ctx);
		});
	}

	/**
	 * Ngxs after bootstrap will be invoked after the root view and all its children have been rendered. Initializes user settings from local storage and sets translation language.
	 * @param ctx
	 */
	ngxsAfterBootstrap(ctx: StateContext<SettingsStateModel>): void {
		this.log.trace('ngxsAfterBootstrap invoked.', this);
		ctx.dispatch([new Settings.InitStateFromLocalStorage(), new Settings.SetTranslateLanguage()]);
	}

	/**
	 * Action handler that initialize settings from local storage.
	 * @param ctx
	 */
	@Action(Settings.InitStateFromLocalStorage)
	initFromLocalStorage(ctx: StateContext<SettingsStateModel>): void {
		ctx.setState(
			produce((draft: SettingsStateModel) => {
				return { ...draft, ...(LocalStorageService.loadInitialState() as SettingsStateModel) };
			})
		);
	}

	/**
	 * Action handler that sets translation language.
	 * @param ctx
	 * @returns action to set application title.
	 */
	@Action(Settings.SetTranslateLanguage)
	setTranslateLanguage(ctx: StateContext<SettingsStateModel>): Observable<void> {
		const language = ctx.getState().settings.language;
		this.translateService.use(language);
		return ctx.dispatch(new Settings.SetTitle());
	}

	/**
	 * Action handler that sets page title based on selected language.
	 */
	@Action(Settings.SetTitle)
	setTitle(): void {
		this.titleService.setTitle(this.router.routerState.snapshot.root, this.translateService);
	}

	/**
	 * Action handler that changes language setting.
	 * @param ctx
	 * @param action
	 * @returns actions to persist settings and set translation language.
	 */
	@Action(Settings.ChangeLanguage)
	changeLanguage(ctx: StateContext<SettingsStateModel>, action: Settings.ChangeLanguage): Observable<void> {
		ctx.setState(
			produce((draft: SettingsStateModel) => {
				draft.settings = { ...draft.settings, ...action.payload };
			})
		);
		const settings = ctx.getState().settings;
		return ctx.dispatch([new Settings.PersistSettings(settings), new Settings.SetTranslateLanguage()]);
	}

	/**
	 * Action handler that changes theme setting.
	 * @param ctx
	 * @param action
	 * @returns actions to persist settings.
	 */
	@Action(Settings.ChangeTheme)
	changeTheme(ctx: StateContext<SettingsStateModel>, action: Settings.ChangeTheme): Observable<void> {
		ctx.setState(
			produce((draft: SettingsStateModel) => {
				draft.settings = { ...draft.settings, ...action.payload };
			})
		);
		const settings = ctx.getState().settings;
		return ctx.dispatch(new Settings.PersistSettings(settings));
	}

	/**
	 * Action Handler that changes auto night mode setting.
	 * @param ctx
	 * @param action
	 * @returns action to persist settings.
	 */
	@Action(Settings.ChangeAutoNightMode)
	changeAutoNightMode(ctx: StateContext<SettingsStateModel>, action: Settings.ChangeAutoNightMode): Observable<void> {
		ctx.setState(
			produce((draft: SettingsStateModel) => {
				draft.settings = { ...draft.settings, ...action.payload };
			})
		);
		const settings = ctx.getState().settings;
		return ctx.dispatch(new Settings.PersistSettings(settings));
	}

	/**
	 * Action handler that changes the configured hour.
	 * @param ctx
	 * @param action
	 * @returns action to persist settings.
	 */
	@Action(Settings.ChangeHour)
	changeHour(ctx: StateContext<SettingsStateModel>, action: Settings.ChangeHour): Observable<void> {
		ctx.setState(
			produce((draft: SettingsStateModel) => {
				draft.settings = { ...draft.settings, ...action.payload };
			})
		);
		const settings = ctx.getState().settings;
		return ctx.dispatch(new Settings.PersistSettings(settings));
	}

	/**
	 * Action handler that changes page animations setting.
	 * @param ctx
	 * @param action
	 * @returns action to persist settings.
	 */
	@Action(Settings.ChangeAnimationsPage)
	changeAnimationsPage(ctx: StateContext<SettingsStateModel>, action: Settings.ChangeAnimationsPage): Observable<void> {
		ctx.setState(
			produce((draft: SettingsStateModel) => {
				draft.settings = { ...draft.settings, ...action.payload };
			})
		);
		const settings = ctx.getState().settings;
		return ctx.dispatch(new Settings.PersistSettings(settings));
	}

	/**
	 * Action handler that changes elements animation on page.
	 * @param ctx
	 * @param action
	 * @returns action to persist settings.
	 */
	@Action(Settings.ChangeAnimationsElements)
	changeAnimationsElements(ctx: StateContext<SettingsStateModel>, action: Settings.ChangeAnimationsElements): Observable<void> {
		ctx.setState(
			produce((draft: SettingsStateModel) => {
				draft.settings = { ...draft.settings, ...action.payload };
			})
		);
		const settings = ctx.getState().settings;
		return ctx.dispatch(new Settings.PersistSettings(settings));
	}

	/**
	 * Action handler that disables page animations.
	 * @param ctx
	 * @param action
	 * @returns action to persist settings.
	 */
	@Action(Settings.ChangeAnimationsPageDisabled)
	changeAnimationsPageDisabled(ctx: StateContext<SettingsStateModel>, action: Settings.ChangeAnimationsPageDisabled): Observable<void> {
		ctx.setState(
			produce((draft: SettingsStateModel) => {
				draft.settings = { ...draft.settings, ...action.payload };
				draft.settings.pageAnimations = false;
			})
		);
		const settings = ctx.getState().settings;
		return ctx.dispatch(new Settings.PersistSettings(settings));
	}

	/**
	 * Action handler that changes sticky header setting.
	 * @param ctx
	 * @param action
	 * @returns action to persist settings.
	 */
	@Action(Settings.ChangeStickyHeader)
	changeStickyHeader(ctx: StateContext<SettingsStateModel>, action: Settings.ChangeStickyHeader): Observable<void> {
		ctx.setState(
			produce((draft: SettingsStateModel) => {
				draft.settings = { ...draft.settings, ...action.payload };
			})
		);
		const settings = ctx.getState().settings;
		return ctx.dispatch(new Settings.PersistSettings(settings));
	}

	/**
	 * Action handler that persists settings to local storage.
	 * @param ctx
	 * @param action
	 */
	@Action(Settings.PersistSettings)
	persistSettings(ctx: StateContext<SettingsStateModel>, action: Settings.PersistSettings): void {
		this.localStorageService.setItem(SETTINGS_KEY, action.payload);
	}
}
