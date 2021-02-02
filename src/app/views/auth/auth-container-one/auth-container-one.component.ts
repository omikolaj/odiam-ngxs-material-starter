import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { BreakpointState, BreakpointObserver } from '@angular/cdk/layout';
import { MinScreenSizeQuery } from 'app/shared/screen-size-queries';
import { ROUTE_ANIMATIONS_ELEMENTS } from 'app/core/core.module';
import { AuthFacadeService } from '../auth-facade.service';
import { tap } from 'rxjs/operators';

/**
 * Auth container component.
 */
@Component({
	selector: 'odm-auth-container-one',
	templateUrl: './auth-container-one.component.html',
	styleUrls: ['./auth-container-one.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthContainerOneComponent {
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
	_activeAuthType$: Observable<string>;

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
		this._activeAuthType$ = facade.activeAuthType$.pipe(tap((value) => console.log('logging from constructor', value)));
		this.facade.router.url === '/auth/sign-in'
			? this.facade.onSwitchAuth({ activeAuthType: 'sign-in-active' }, 'sign-in')
			: this.facade.onSwitchAuth({ activeAuthType: 'sign-up-active' }, 'sign-up');
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
}
