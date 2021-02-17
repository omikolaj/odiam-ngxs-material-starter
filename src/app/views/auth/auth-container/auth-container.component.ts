import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { BreakpointState, BreakpointObserver } from '@angular/cdk/layout';
import { MinScreenSizeQuery } from 'app/shared/screen-size-queries';
import { ROUTE_ANIMATIONS_ELEMENTS, routeAnimations } from 'app/core/core.module';
import { AuthFacadeService } from '../auth-facade.service';
import { ActiveAuthType } from 'app/core/auth/active-auth-type.model';
import { tap, startWith } from 'rxjs/operators';
import { NavigationEnd } from '@angular/router';

/**
 * Auth container component.
 */
@Component({
	selector: 'odm-auth-container',
	templateUrl: './auth-container.component.html',
	styleUrls: ['./auth-container.component.scss'],
	animations: [routeAnimations],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthContainerComponent implements OnInit, OnDestroy {
	/**
	 * Route animations elements of auth container component.
	 */
	_routeAnimationsElements = ROUTE_ANIMATIONS_ELEMENTS;

	/**
	 * Image located at the bottom of this component.
	 */

	_authContainerImg = (require('../../../../assets/auth_bottom.jpg') as { default: string }).default;

	/**
	 * Whether specified screen width was matched.
	 */
	_breakpointStateScreenMatcher$: Observable<BreakpointState>;

	/**
	 * Whether to display sign-in or sign-up component.
	 */
	_activeAuthType$: Observable<ActiveAuthType>;

	/**
	 * Whether user is on forgot-password route.
	 */
	get _forgotPasswordIsDisplayed(): boolean {
		return this.facade.router.url === '/auth/forgot-password';
	}

	/**
	 * Rxjs subscriptions for this component.
	 */
	private _subscription = new Subscription();

	/**
	 * Creates an instance of auth container component.
	 * @param breakpointObserver
	 * @param facade
	 */
	constructor(breakpointObserver: BreakpointObserver, private facade: AuthFacadeService) {
		this._breakpointStateScreenMatcher$ = breakpointObserver.observe([MinScreenSizeQuery.md]);
		this._activeAuthType$ = facade.activeAuthType$;
	}

	/**
	 * NgOnInit life cycle.
	 */
	ngOnInit(): void {
		this.facade.log.trace('Initialized.', this);

		this._subscription.add(
			this.facade.router.events
				.pipe(
					startWith(this._setActiveAuthTypeBasedOnUrl(this.facade.router.url)),
					// we need to always respond to route events when this component is loaded.
					// That's what loads sign-in/sign-up/forgot-password components based on the current url.
					tap((event) => {
						if (event instanceof NavigationEnd) {
							this._setActiveAuthTypeBasedOnUrl(event.url);
						}
					})
				)
				.subscribe()
		);
	}

	/**
	 * NgOnDestroy life cycle.
	 */
	ngOnDestroy(): void {
		this.facade.log.trace('Destroyed.', this);
		this._subscription.unsubscribe();
	}

	/**
	 * Sets active auth type based on url.
	 * @param url
	 */
	private _setActiveAuthTypeBasedOnUrl(url: string): void {
		if (url === '/auth/sign-in' || url === '/auth') {
			this.facade.onSwitchAuth({ activeAuthType: 'sign-in-active' }, 'sign-in');
		} else if (url === '/auth/sign-up') {
			this.facade.onSwitchAuth({ activeAuthType: 'sign-up-active' }, 'sign-up');
		} else if (url === '/auth/forgot-password') {
			this.facade.onUpdateActiveAuthType({ activeAuthType: 'forgot-password-active' });
		}
	}

	/**
	 * Switchs to signin.
	 */
	_switchToSignin(): void {
		this.facade.onSwitchAuth({ activeAuthType: 'sign-in-active' }, 'sign-in');
	}

	/**
	 * Switchs to signup.
	 */
	_switchToSignup(): void {
		this.facade.onSwitchAuth({ activeAuthType: 'sign-up-active' }, 'sign-up');
	}

	/**
	 * Sets the active auth css class which dictates if we are displaying sign-in/sign-up component.
	 * and it also sets specific css class for sign-in component to account for extra blank space between
	 * login component and the image.
	 * @param authType
	 * @param matcher
	 * @returns active auth css class
	 */
	_setActiveAuthCssClass(authType: ActiveAuthType, matcher: BreakpointState): string {
		let cssClasses: string = authType;
		if (!matcher.matches) {
			cssClasses += authType === 'sign-in-active' ? ' ' + 'auth-container__sign-in' : '';
		}
		return cssClasses;
	}
}
