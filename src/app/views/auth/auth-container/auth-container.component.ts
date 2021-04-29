import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { BreakpointState, BreakpointObserver } from '@angular/cdk/layout';
import { MinScreenSizeQuery } from 'app/shared/screen-size-queries';
import { ROUTE_ANIMATIONS_ELEMENTS, routeAnimations } from 'app/core/core.module';
import { tap, startWith } from 'rxjs/operators';
import { NavigationEnd, UrlSegment } from '@angular/router';
import { ActiveAuthType } from 'app/core/models/auth/active-auth-type.model';
import { AuthSandboxService } from '../auth-sandbox.service';

/**
 * Auth container component that houses all functionality responsible for displaying sign-in/sign-up/forgot-password.
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
	 * Route animations.
	 */
	readonly _routeAnimationsElements = ROUTE_ANIMATIONS_ELEMENTS;

	/**
	 * Image located at the bottom of this component.
	 */

	readonly _authContainerImg = (require('../../../../assets/auth_bottom.jpg') as { default: string }).default;

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
		return this._sb.router.url === '/auth/forgot-password';
	}

	/**
	 * Whether user is on two step verification route.
	 */
	get _twoStepVerificationIsDisplayed(): boolean {
		return this._sb.router.url.includes('/auth/two-step-verification');
	}

	/**
	 * Whether user is on redeem recovery code route.
	 */
	get _redeemRecoveryCodeIsDisplayed(): boolean {
		return this._sb.router.url.includes('/auth/redeem-recovery-code');
	}

	/**
	 * Whether user is on two step verification route.
	 */
	get _signInIsDisplayed(): boolean {
		return this._sb.router.url === '/auth/sign-in';
	}

	/**
	 * Rxjs subscriptions for this component.
	 */
	private readonly _subscription = new Subscription();

	/**
	 * Creates an instance of auth container component.
	 * @param breakpointObserver
	 * @param _sb
	 */
	constructor(breakpointObserver: BreakpointObserver, private _sb: AuthSandboxService) {
		this._breakpointStateScreenMatcher$ = breakpointObserver.observe([MinScreenSizeQuery.md]);
		this._activeAuthType$ = _sb.activeAuthType$;
	}

	/**
	 * NgOnInit life cycle.
	 */
	ngOnInit(): void {
		this._sb.log.trace('Initialized.', this);

		this._subscription.add(
			this._sb.router.events
				.pipe(
					startWith(this._setActiveAuthTypeBasedOnUrl(this._sb.router.url)),
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
		this._sb.log.trace('Destroyed.', this);
		this._subscription.unsubscribe();
	}

	/**
	 * Sets active auth type based on url.
	 * @param url
	 */
	private _setActiveAuthTypeBasedOnUrl(url: string): void {
		console.log('url', url);
		if (url === '/auth/sign-in' || url === '/auth') {
			this._sb.onSwitchAuth({ activeAuthType: 'sign-in-active' }, 'sign-in');
		} else if (url === '/auth/sign-up') {
			this._sb.onSwitchAuth({ activeAuthType: 'sign-up-active' }, 'sign-up');
		} else if (url === '/auth/forgot-password') {
			this._sb.updateActiveAuthType({ activeAuthType: 'forgot-password-active' });
		} else if (url.includes('/auth/two-step-verification')) {
			this._sb.updateActiveAuthType({ activeAuthType: 'two-step-verification-active' });
		} else {
			this._sb.log.error('the auth url does not match any configured paths.', this);
		}
	}

	/**
	 * Determines whether the route is on sign-in/sign-up routes. This disables normal animation for those routes.
	 * @param url
	 * @returns true if not sign in or sign up
	 */
	_isNotSignInOrSignUp(url: UrlSegment[]): boolean {
		const urlString = url[0]?.path;
		if (urlString) {
			if (urlString === 'sign-in' || urlString === 'sign-up') {
				return false;
			}
		}
		return true;
	}

	/**
	 * Switchs to signin.
	 */
	_switchToSignin(): void {
		this._sb.onSwitchAuth({ activeAuthType: 'sign-in-active' }, 'sign-in');
	}

	/**
	 * Switchs to signup.
	 */
	_switchToSignup(): void {
		this._sb.onSwitchAuth({ activeAuthType: 'sign-up-active' }, 'sign-up');
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
