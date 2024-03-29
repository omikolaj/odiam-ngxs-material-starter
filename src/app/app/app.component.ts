import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { NavigationEnd } from '@angular/router';
import { ActionCompletion } from '@ngxs/store';
import { Language } from 'app/core/settings/settings-state.model';
import browser from 'browser-detect';
import { Observable, Subscription } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
import { environment as env } from '../../environments/environment';
import { AppSandboxService } from '../app-sandbox.service';
import { routeAnimations } from '../core/core.module';

/**
 * AppComponent displays navbar, footer and named router-outlet '#o=outlet'.
 */
@Component({
	selector: 'odm-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
	animations: [routeAnimations]
})
export class AppComponent implements OnInit, OnDestroy {
	/**
	 * Indicates the environment the application is running under.
	 */
	readonly _isProd = env.production;

	/**
	 * String value of DEV or PROD depending on the environment.
	 */
	readonly _envName = env.envName;

	/**
	 * String value representing current version of the app. For example 10.0.2.
	 */
	readonly _version = env.versions.app as string;

	/**
	 * Gets the current year.
	 */
	readonly _year = new Date().getFullYear();

	/**
	 * Gets left hand side logo url.
	 * For SSR this is the only way logo gets loaded correctly.
	 */
	readonly _logo = '../../assets/logo.png';

	/**
	 * List of currently available languages.
	 */
	readonly _languages = ['en', 'de', 'sk', 'fr', 'es', 'pt-br', 'zh-cn', 'he'];

	/**
	 * Navigation options.
	 */
	readonly _navigation = [
		{ link: 'about', label: 'odm.menu.about' },
		{ link: 'feature-list', label: 'odm.menu.features' },
		{ link: 'examples', label: 'odm.menu.examples' }
	];

	/**
	 * Navigation options for side drawer.
	 */
	readonly _navigationSideMenu = [...this._navigation, { link: 'settings', label: 'odm.menu.settings' }];

	/**
	 * Stream indicating if user is authenticated.
	 */
	_isAuthenticated$: Observable<boolean>;

	/**
	 * Stream for sticky header setting.
	 */
	_stickyHeader$: Observable<boolean>;

	/**
	 * Stream for current language setting.
	 */
	_language$: Observable<string>;

	/**
	 * Stream for current theme.
	 */
	_theme$: Observable<string>;

	/**
	 * Whether Auth.Signout action has been dispatched and completed.
	 */
	signedOut$: Observable<ActionCompletion<any, Error>>;

	/**
	 * Rxjs subscriptions for this component.
	 */
	private readonly _subscription = new Subscription();

	/**
	 * Creates an instance of app component.
	 * @param _router
	 * @param _sb
	 */
	constructor(private _sb: AppSandboxService) {
		this.signedOut$ = _sb.signedOut$;

		// Set up google analytics
		this._subscription.add(
			_sb.router.events
				.pipe(
					filter((event) => event instanceof NavigationEnd),
					tap((event: NavigationEnd) => {
						/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
						// (<any>window).ga('set', 'page', event.urlAfterRedirects);
						// (<any>window).ga('send', 'pageview');
					})
				)
				.subscribe()
		);
	}

	/**
	 * Determines whether browser is IE, Edge or Safari.
	 * @returns true if browser is IE, Edge or Safari.
	 */
	private static _isIEorEdgeOrSafari(): boolean {
		return ['ie', 'edge', 'safari'].includes(browser().name);
	}

	/**
	 * NgOnInit life cycle. Performs local storage test as well as sets the state of the application.
	 */
	ngOnInit(): void {
		this._sb.log.trace('Initialized.', this);
		this._sb.testLocalStorage();

		this._subscription.add(this._onListenForSignedOut$().subscribe());

		if (AppComponent._isIEorEdgeOrSafari()) {
			this._sb.disablePageAnimations();
		}

		this._onInitSetSettingOptions();
	}

	/**
	 * NgOnDestroy life cycle.
	 */
	ngOnDestroy(): void {
		this._sb.log.trace('Destroyed.', this);
		this._subscription.unsubscribe();
	}

	/**
	 * Event handler for logging user in.
	 */
	_onSigninClicked(): void {
		this._sb.log.debug('_onSigninClicked handler fired.', this);
		void this._sb.router.navigate(['auth/sign-in']);
	}

	/**
	 * Event handler for when user clicks the account button.
	 */
	_onDashboardClicked(): void {
		this._sb.log.debug('_onDashboardClicked event handler fired.', this);
		void this._sb.router.navigate(['account']);
	}

	/**
	 * Event handler for signing user out.
	 */
	_onSignoutClicked(): void {
		this._sb.log.debug('_onSignoutClicked handler fired.', this);
		this._sb.signOut();
	}

	/**
	 * Language select handler for nav bar language selection.
	 * @param MatSelectChange
	 */
	_onLanguageSelectChanged(event: MatSelectChange): void {
		this._sb.log.debug(`_onLanguageSelectChanged handler fired with: ${event.value as Language}.`, this);
		this._sb.changeLanguage(event.value as string);
	}

	/**
	 * Emits when Auth.Signout action has been dispatched and completed.
	 * @returns signedOut$
	 */
	private _onListenForSignedOut$(): Observable<any> {
		this._sb.log.debug('_onListenForSignedOut$ executing.', this);
		return this.signedOut$.pipe(tap(() => void this._sb.router.navigate(['auth/sign-in'])));
	}

	/**
	 * Initializes settings options from the store.
	 */
	private _onInitSetSettingOptions(): void {
		this._sb.log.debug('_onInitSetSettingOptions executing.', this);
		this._isAuthenticated$ = this._sb.isAuthenticated$;
		this._stickyHeader$ = this._sb.stickyHeader$;
		this._language$ = this._sb.language$;
		this._theme$ = this._sb.theme$;
	}
}
