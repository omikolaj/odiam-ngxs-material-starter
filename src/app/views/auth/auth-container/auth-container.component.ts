import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { BreakpointState, BreakpointObserver } from '@angular/cdk/layout';
import { MinScreenSizeQuery } from 'app/shared/screen-size-queries';
import { ROUTE_ANIMATIONS_ELEMENTS } from 'app/core/core.module';
import { AuthFacadeService } from '../auth-facade.service';
import { ActiveAuthType } from 'app/core/auth/active-auth-type.model';

/**
 * Auth container component.
 */
@Component({
	selector: 'odm-auth-container',
	templateUrl: './auth-container.component.html',
	styleUrls: ['./auth-container.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthContainerComponent implements OnInit {
	/**
	 * Route animations elements of auth container component.
	 */
	_routeAnimationsElements = ROUTE_ANIMATIONS_ELEMENTS;

	/**
	 * Laptop img url.
	 */
	_laptopImgUrl = 'https://res.cloudinary.com/hetfy/image/upload/v1603459311/laptop_hkaxzz.png';

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
		if (this.facade.router.url === '/auth/sign-in') {
			this.facade.onSwitchAuth({ activeAuthType: 'sign-in-active' }, 'sign-in');
		} else if (this.facade.router.url === '/auth/sign-up') {
			this.facade.onSwitchAuth({ activeAuthType: 'sign-up-active' }, 'sign-up');
		} else if (this.facade.router.url === '/auth/forgot-password') {
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
