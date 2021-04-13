import browser from 'browser-detect';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { environment as env } from '../../environments/environment';
import { routeAnimations } from '../core/core.module';

import { Language } from 'app/core/settings/settings-state.model';
import { MatSelectChange } from '@angular/material/select';

import { Router, NavigationEnd } from '@angular/router';
import { filter, tap } from 'rxjs/operators';

import { AppSandboxService } from '../app-sandbox.service';

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
	 */
	readonly _logo = (require('../../assets/logo.png') as { default: string }).default;

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
	 * Rxjs subscriptions for this component.
	 */
	private readonly _subscription = new Subscription();

	/**
	 * Creates an instance of app component.
	 * @param _router
	 * @param _sb
	 */
	constructor(private _router: Router, private _sb: AppSandboxService) {
		// Set up google analytics
		this._subscription.add(
			_router.events
				.pipe(
					filter((event) => event instanceof NavigationEnd),
					tap((event: NavigationEnd) => {
						/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
						(<any>window).ga('set', 'page', event.urlAfterRedirects);
						(<any>window).ga('send', 'pageview');
					})
				)
				.subscribe()
		);
	}

	/**
	 * Determines whether browser is IE, Edge or Safari.
	 * @returns true if browser is IE, Edge or Safari.
	 */
	private static isIEorEdgeOrSafari() {
		return ['ie', 'edge', 'safari'].includes(browser().name);
	}

	/**
	 * NgOnInit life cycle. Performs local storage test as well as sets the state of the application.
	 */
	ngOnInit(): void {
		this._sb.log.trace('Initialized.', this);
		this._sb.testLocalStorage();

		if (AppComponent.isIEorEdgeOrSafari()) {
			this._sb.disablePageAnimations();
		}

		this._onInitSetSettingOptions();
	}

	/**
	 * NgOnDestroy life cycle.
	 */
	ngOnDestroy(): void {
		this._subscription.unsubscribe();
	}

	/**
	 * Initializes settings options from the store.
	 */
	private _onInitSetSettingOptions(): void {
		this._isAuthenticated$ = this._sb.isAuthenticated$;
		this._stickyHeader$ = this._sb.stickyHeader$;
		this._language$ = this._sb.language$;
		this._theme$ = this._sb.theme$;
	}

	/**
	 * Event handler for logging user in.
	 */
	_onSigninClicked(): void {
		this._sb.log.debug('onSigninClick handler fired.', this);
		void this._router.navigate(['auth/sign-in']);
	}

	/**
	 * Event handler for when user clicks the account button.
	 */
	_onDashboardClicked(): void {
		this._sb.log.debug('onDashboardClick event handler fired.', this);
		void this._router.navigate(['account']);
	}

	/**
	 * Event handler for signing user out.
	 */
	_onSignoutClicked(): void {
		this._sb.log.debug('onSignoutClick handler fired.', this);
		this._sb.signOut();
	}

	/**
	 * Language select handler for nav bar language selection.
	 * @param MatSelectChange
	 */
	_onLanguageSelectChanged(event: MatSelectChange): void {
		this._sb.log.debug(`onLanguageSelect handler fired with: ${event.value as Language}.`, this);
		this._sb.changeLanguage(event.value as string);
	}
}
