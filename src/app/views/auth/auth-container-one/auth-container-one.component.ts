import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { BreakpointState, BreakpointObserver } from '@angular/cdk/layout';
import { MinScreenSizeQuery } from 'app/shared/screen-size-queries';
import { ROUTE_ANIMATIONS_ELEMENTS, routeAnimations } from 'app/core/core.module';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
	selector: 'odm-auth-container-one',
	templateUrl: './auth-container-one.component.html',
	styleUrls: ['./auth-container-one.component.scss'],
	animations: [routeAnimations],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthContainerOneComponent implements OnInit {
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

	_signUp: 'right-panel-active' | 'left-panel-active';

	constructor(breakpointObserver: BreakpointObserver, private router: Router, private route: ActivatedRoute) {
		this._breakpointStateScreenMatcher$ = breakpointObserver.observe([MinScreenSizeQuery.md]);
	}

	ngOnInit(): void {}

	_switchToSignin(): void {
		this._signUp = 'left-panel-active';
		//void this.router.navigate(['sign-in'], { relativeTo: this.route });
		setTimeout(() => {
			void this.router.navigate(['sign-in'], { relativeTo: this.route });
		}, 600);
	}

	_switchToSignup(): void {
		this._signUp = 'right-panel-active';
		//void this.router.navigate(['sign-up'], { relativeTo: this.route });
		setTimeout(() => {
			void this.router.navigate(['sign-up'], { relativeTo: this.route });
		}, 600);
	}
}
