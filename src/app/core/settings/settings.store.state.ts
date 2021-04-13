import { Router } from '@angular/router';
import { Injectable, NgZone } from '@angular/core';
import { Action, Selector, State, StateContext, StateToken, NgxsOnInit } from '@ngxs/store';
import { LocalStorageService } from '../local-storage/local-storage.service';
import produce from 'immer';
import { DEFAULT_THEME, NIGHT_MODE_THEME, SETTINGS_KEY, SettingsStateModel } from './settings-state.model';
import { TranslateService } from '@ngx-translate/core';
import { TitleService } from 'app/core/title/title.service';
import * as Settings from './settings.store.actions';
import { Observable } from 'rxjs';
import { LogService } from '../logger/log.service';
import { OverlayContainer } from '@angular/cdk/overlay';
import { AnimationsService } from '../animations/animations.service';

const SETTINGS_STATE_TOKEN = new StateToken<SettingsStateModel>('settings');

@State<SettingsStateModel>({
	name: SETTINGS_STATE_TOKEN,
	defaults: {
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
})
@Injectable()

/**
 * Provides all action handlers and selectors for user settings.
 */
export class SettingsState implements NgxsOnInit {
	/**
	 * Variable used to store previously set hour for auto night mode.
	 */
	private _hour = 0;

	/**
	 * Selects user settings.
	 * @param state
	 * @returns settings
	 */
	@Selector([SETTINGS_STATE_TOKEN])
	static selectSettings(state: SettingsStateModel): SettingsStateModel {
		return state;
	}

	/**
	 * Selects current language setting.
	 * @param state
	 * @returns language settings.
	 */
	@Selector([SETTINGS_STATE_TOKEN])
	static selectLanguageSettings(state: SettingsStateModel): string {
		return state.language;
	}

	/**
	 * Selects sticky header setting.
	 * @param state
	 * @returns sticky header configuration.
	 */
	@Selector([SETTINGS_STATE_TOKEN])
	static selectStickyHeaderSettings(state: SettingsStateModel): boolean {
		return state.stickyHeader;
	}

	/**
	 * Selects current theme based on user selection and current time.
	 * @param state
	 * @param theme currently set theme.
	 * @param nightTheme theme for dark mode.
	 * @param isNightHour rather if its night time.
	 * @returns effective theme.
	 */
	@Selector([SettingsState._selectTheme, SettingsState._selectNightTheme, SettingsState._selectIsNightHour])
	static selectEffectiveTheme(state: SettingsState, theme: string, nightTheme: string, isNightHour: boolean): string {
		return (isNightHour ? nightTheme : theme).toLowerCase();
	}

	/**
	 * Selects current theme.
	 * @param state
	 * @returns theme.
	 */
	@Selector([SETTINGS_STATE_TOKEN])
	private static _selectTheme(state: SettingsStateModel): string {
		return state.theme;
	}

	/**
	 * Selects night theme.
	 * @param state
	 * @returns night theme.
	 */
	@Selector([SETTINGS_STATE_TOKEN])
	private static _selectNightTheme(state: SettingsStateModel): string {
		return state.nightTheme;
	}

	/**
	 * Selects status of night hour.
	 * @param state
	 * @param autoNightMode true auto night more is enabled.
	 * @param hour current hour.
	 * @returns true if is night hour.
	 */
	@Selector([SettingsState._selectAutoNightMode, SettingsState._selectHour])
	private static _selectIsNightHour(state: SettingsState, autoNightMode: string, hour: number): boolean {
		return autoNightMode && (hour >= 21 || hour <= 7);
	}

	/**
	 * Selects status of auto night mode.
	 * @param state
	 * @returns true if auto night mode is enabled.
	 */
	@Selector([SETTINGS_STATE_TOKEN])
	private static _selectAutoNightMode(state: SettingsStateModel): boolean {
		return state.autoNightMode;
	}

	/**
	 * Selects hour. Used to determine the effective theme.
	 * @param state
	 * @returns hour.
	 */
	@Selector([SETTINGS_STATE_TOKEN])
	private static _selectHour(state: SettingsStateModel): number {
		return state.hour;
	}

	/**
	 * Sets the current hour setting.
	 */
	private _changeSetHour = (ctx: StateContext<SettingsStateModel>): void => {
		const hour = new Date().getHours();
		this._log.trace(
			`ngxsOnInit setInterval fired. Hour: ${hour} | prevHour: ${this._hour}. Is hour update required: ${String(hour !== this._hour)}.`,
			this
		);
		if (hour !== this._hour) {
			this._hour = hour;
			const hourToSet = { hour };
			this._log.trace(`ngxsOnInit setInterval dispatching action Settings.ChangeHour with data.`, this, hour);
			this._ngZone.runOutsideAngular(() => ctx.dispatch(new Settings.ChangeHour(hourToSet)));
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
		private _localStorageService: LocalStorageService,
		private _translateService: TranslateService,
		private _titleService: TitleService,
		private _animationsService: AnimationsService,
		private _overlayContainer: OverlayContainer,
		private _log: LogService,
		private _router: Router,
		private _ngZone: NgZone
	) {}

	/**
	 * Ngxs on init will be invoked after all states from state's module definition have been initialized and pushed into the state stream.
	 * @param ctx
	 */
	ngxsOnInit(ctx: StateContext<SettingsStateModel>): void {
		this._log.info('ngxsOnInit invoked.', this);
		const theme = ctx.getState().theme;
		ctx.dispatch(new Settings.ChangeTheme({ theme }));
		ctx.dispatch(new Settings.UpdateRouteAnimationType());
		ctx.dispatch(new Settings.SetTranslateLanguage());
		this._ngZone.runOutsideAngular(() => {
			// Fire immediately to check what hour it is.
			this._changeSetHour(ctx);

			// Set interval function to check if hour has changed every minute.
			setInterval(this._changeSetHour, 60_000, ctx);
		});
	}

	/**
	 * Action handler that sets translation language.
	 * @param ctx
	 * @returns action to set application title.
	 */
	@Action(Settings.SetTranslateLanguage)
	setTranslateLanguage(ctx: StateContext<SettingsStateModel>): Observable<void> {
		this._log.info('setTranslateLanguage action handler fired.', this);
		const language = ctx.getState().language;
		this._translateService.use(language);
		return ctx.dispatch(new Settings.SetTitle());
	}

	/**
	 * Action handler that sets page title based on selected language. This is the <title> tag found in
	 * <html>
	 *   <head>
	 *      <title>
	 *         <this is what gets changed>
	 *      </title>
	 *   </head>
	 * </html>
	 * Since an Angular application can't be bootstrapped on the entire HTML document (`<html>` tag)
	 * it is not possible to bind to the `text` property of the `HTMLTitleElement` elements
	 * (representing the `<title>` tag)
	 */
	@Action(Settings.SetTitle)
	setTitle(): void {
		this._log.info('setTitle action handler fired.', this);
		this._titleService.setTitle(this._router.routerState.snapshot.root, this._translateService);
	}

	/**
	 * Action handler that changes language setting.
	 * @param ctx
	 * @param action
	 * @returns actions to persist settings and set translation language.
	 */
	@Action(Settings.ChangeLanguage)
	changeLanguage(ctx: StateContext<SettingsStateModel>, action: Settings.ChangeLanguage): Observable<void> {
		this._log.info('changeLanguage action handler fired.', this, action.payload);
		ctx.setState(
			produce((draft: SettingsStateModel) => {
				draft = { ...draft, ...action.payload };
				return draft;
			})
		);
		const settings = ctx.getState();
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
		this._log.info('changeTheme action handler fired.', this, action.payload);
		this._handleBackgroundOverlay(action.payload.theme);
		ctx.setState(
			produce((draft: SettingsStateModel) => {
				draft = { ...draft, ...action.payload };
				return draft;
			})
		);
		const settings = ctx.getState();
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
		this._log.info('changeAutoNightMode action handler fired.', this);
		ctx.setState(
			produce((draft: SettingsStateModel) => {
				draft = { ...draft, ...action.payload };
				return draft;
			})
		);
		const settings = ctx.getState();
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
		this._log.info('changeHour action handler fired.', this, action.payload);
		ctx.setState(
			produce((draft: SettingsStateModel) => {
				draft = { ...draft, ...action.payload };
				return draft;
			})
		);
		const settings = ctx.getState();
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
		this._log.info('changeAnimationsPage action handler fired.', this, action.payload);
		ctx.setState(
			produce((draft: SettingsStateModel) => {
				draft = { ...draft, ...action.payload };
				return draft;
			})
		);
		const settings = ctx.getState();
		return ctx.dispatch([new Settings.PersistSettings(settings), new Settings.UpdateRouteAnimationType()]);
	}

	/**
	 * Action handler that changes elements animation on page.
	 * @param ctx
	 * @param action
	 * @returns action to persist settings.
	 */
	@Action(Settings.ChangeAnimationsElements)
	changeAnimationsElements(ctx: StateContext<SettingsStateModel>, action: Settings.ChangeAnimationsElements): Observable<void> {
		this._log.info('changeAnimationsElements action handler fired.', this, action.payload);
		ctx.setState(
			produce((draft: SettingsStateModel) => {
				draft = { ...draft, ...action.payload };
				return draft;
			})
		);
		const settings = ctx.getState();
		return ctx.dispatch([new Settings.PersistSettings(settings), new Settings.UpdateRouteAnimationType()]);
	}

	/**
	 * Action handler that updates route animation type.
	 * @param ctx
	 */
	@Action(Settings.UpdateRouteAnimationType)
	updateRouteAnimationType(ctx: StateContext<SettingsStateModel>): void {
		this._log.info('updateRouteAnimationType action handler fired.', this);
		const pageAnimations = ctx.getState().pageAnimations;
		const elementsAnimations = ctx.getState().elementsAnimations;

		this._animationsService.updateRouteAnimationType(pageAnimations, elementsAnimations);
	}

	/**
	 * Action handler that disables page animations.
	 * @param ctx
	 * @param action
	 * @returns action to persist settings.
	 */
	@Action(Settings.ChangeAnimationsPageDisabled)
	changeAnimationsPageDisabled(ctx: StateContext<SettingsStateModel>, action: Settings.ChangeAnimationsPageDisabled): Observable<void> {
		this._log.info('changeAnimationsPageDisabled action handler fired.', this, action.payload);
		ctx.setState(
			produce((draft: SettingsStateModel) => {
				draft = { ...draft, ...action.payload };
				draft.pageAnimations = false;
				return draft;
			})
		);
		const settings = ctx.getState();
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
		this._log.info('changeStickyHeader action handler fired.', this, action.payload);
		ctx.setState(
			produce((draft: SettingsStateModel) => {
				draft = { ...draft, ...action.payload };
				return draft;
			})
		);
		const settings = ctx.getState();
		return ctx.dispatch(new Settings.PersistSettings(settings));
	}

	/**
	 * Action handler that persists settings to local storage.
	 * @param ctx
	 * @param action
	 */
	@Action(Settings.PersistSettings)
	persistSettings(ctx: StateContext<SettingsStateModel>, action: Settings.PersistSettings): void {
		this._log.info('persistSettings action handler fired.', this, action.payload);
		this._localStorageService.setItem(SETTINGS_KEY, action.payload);
	}

	/**
	 * Handles background overlay color.
	 * @param theme
	 */
	private _handleBackgroundOverlay(theme: string): void {
		// removes/adds background to overlay container. For example without this code
		// all select drop down menus do not have a background and are transparent
		const classList = this._overlayContainer.getContainerElement().classList;
		const toRemove = Array.from(classList).filter((item: string) => item.includes('-theme'));
		if (toRemove.length) {
			classList.remove(...toRemove);
		}
		classList.add(theme.toLocaleLowerCase());
	}
}
