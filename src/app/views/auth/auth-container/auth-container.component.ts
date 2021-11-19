import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, UrlSegment } from '@angular/router';
import { ActionCompletion } from '@ngxs/store';
import { routeAnimations, ROUTE_ANIMATIONS_ELEMENTS } from 'app/core/core.module';
import { ActiveAuthType } from 'app/core/models/auth/active-auth-type.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { MinScreenSizeQuery } from 'app/shared/screen-size-queries';
import { combineLatest, merge, Observable, Subscription } from 'rxjs';
import { startWith, tap } from 'rxjs/operators';
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
	 * Whether user is on reset password route.
	 */
	get _resetPasswordIsDisplayed(): boolean {
		return this._sb.router.url.includes('/auth/reset-password');
	}

	/**
	 * Whether user is on the successful-registration route.
	 * [CONFIRMATION-WALL]: Keep code if confirmation wall is required.
	 */
	// get _successfulRegistration(): boolean {
	// 	return this._sb.router.url.includes('/auth/successful-registration');
	// }

	/**
	 * Whether user is on the email-confirmation route.
	 */
	get _emailConfirmation(): boolean {
		return this._sb.router.url.includes('/email-confirmation');
	}

	/**
	 * Whether user is on the email-change-confirmation route.
	 */
	get _emailChangeConfirmation(): boolean {
		return this._sb.router.url.includes('/email-change-confirmation');
	}

	/**
	 * Whether user is on two step verification route.
	 */
	get _signInIsDisplayed(): boolean {
		return this._sb.router.url === '/auth/sign-in';
	}

	/**
	 * Determines whether two step verification is required.
	 */
	private _isTwoStepVerificationRequired$: Observable<boolean>;

	/**
	 * Two step verification provider.
	 * (Authenticator, email, sms etc.)
	 */
	private _twoStepVerificationProvider$: Observable<string>;

	/**
	 * Two step verification email.
	 */
	private _twoStepVerificationEmail$: Observable<string>;

	/**
	 * Whether user is authenticated.
	 */
	private _isAuthenticated$: Observable<boolean>;

	/**
	 * Whether two step verification cancelled action has dispatched and completed.
	 */
	private _twoStepVerificationCancelled$: Observable<ActionCompletion<any, Error>>;

	/**
	 * Whether Auth.Signin action dispatched and completed.
	 */
	private _signInActionCompleted$: Observable<ActionCompletion<any, Error>>;

	/**
	 * Emitted when server responds with 40X error.
	 */
	private _problemDetails$: Observable<ProblemDetails>;

	/**
	 * Emitted when server responds with 50X error.
	 */
	private _internalServerErrorDetails$: Observable<InternalServerErrorDetails>;

	/**
	 * Rxjs subscriptions for this component.
	 */
	private readonly _subscription = new Subscription();

	/**
	 * Creates an instance of auth container component.
	 * @param breakpointObserver
	 * @param _sb
	 */
	constructor(breakpointObserver: BreakpointObserver, private _sb: AuthSandboxService, private _route: ActivatedRoute) {
		this._problemDetails$ = _sb.problemDetails$;
		this._internalServerErrorDetails$ = _sb.internalServerErrorDetails$;
		this._breakpointStateScreenMatcher$ = breakpointObserver.observe([MinScreenSizeQuery.md]);
		this._activeAuthType$ = _sb.activeAuthType$;
		this._isTwoStepVerificationRequired$ = _sb.isTwoStepVerificationRequired$;
		this._twoStepVerificationProvider$ = _sb.twoStepVerificationProvider$;
		this._twoStepVerificationEmail$ = _sb.twoStepVerificationEmail$;
		this._isAuthenticated$ = _sb.isAuthenticated$;
		this._twoStepVerificationCancelled$ = _sb.twoStepVerificationCancelled$;
		this._signInActionCompleted$ = _sb.signInActionCompleted$;
	}

	/**
	 * NgOnInit life cycle.
	 */
	ngOnInit(): void {
		this._sb.log.trace('Initialized.', this);
		this._subscription.add(this._navigationEndEvent$().subscribe());
		this._subscription.add(this._listenIfTwoStepVerificationRequired$().subscribe());
		this._subscription.add(this._listenForServerErrors$().subscribe());
		this._subscription.add(this._stopSigningUserIn$().subscribe());
	}

	/**
	 * NgOnDestroy life cycle.
	 */
	ngOnDestroy(): void {
		this._sb.log.trace('Destroyed.', this);
		this._subscription.unsubscribe();
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
		this._sb.updateActiveAuthType({ activeAuthType: 'sign-in-active' });
		setTimeout(() => {
			void this._sb.router.navigate(['sign-in'], { relativeTo: this._route.parent });
		}, 300);
	}

	/**
	 * Switchs to signup.
	 */
	_switchToSignup(): void {
		this._sb.updateActiveAuthType({ activeAuthType: 'sign-up-active' });
		setTimeout(() => {
			void this._sb.router.navigate(['sign-up'], { relativeTo: this._route.parent });
		}, 300);
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

	/**
	 * Sets active auth type based on url.
	 * @param url
	 */
	private _setActiveAuthTypeBasedOnUrl(url: string): void {
		if (url === '/auth/sign-in' || url === '/auth') {
			this._sb.updateActiveAuthType({ activeAuthType: 'sign-in-active' });
			setTimeout(() => {
				void this._sb.router.navigate(['sign-in'], { relativeTo: this._route.parent });
			}, 300);
		} else if (url === '/auth/sign-up') {
			this._sb.updateActiveAuthType({ activeAuthType: 'sign-up-active' });
			setTimeout(() => {
				void this._sb.router.navigate(['sign-up'], { relativeTo: this._route.parent });
			}, 300);
		} else if (url === '/auth/forgot-password') {
			this._sb.updateActiveAuthType({ activeAuthType: 'forgot-password-active' });
		} else if (url.includes('/auth/two-step-verification')) {
			this._sb.updateActiveAuthType({ activeAuthType: 'two-step-verification-active' });
		} else if (url.includes('/auth/reset-password')) {
			this._sb.updateActiveAuthType({ activeAuthType: 'reset-password-active' });
		}
		// [CONFIRMATION-WALL]: Keep code if confirmation wall is required.
		//   else if (url.includes('/auth/successful-registration')) {
		// 	this._sb.updateActiveAuthType({ activeAuthType: 'successful-registration-active' });
		// }
		else if (url.includes('/email-confirmation')) {
			this._sb.updateActiveAuthType({ activeAuthType: 'email-confirmation-active' });
		} else if (url.includes('/email-change-confirmation')) {
			this._sb.updateActiveAuthType({ activeAuthType: 'email-change-confirmation-active' });
		} else {
			this._sb.log.error('the auth url does not match any configured paths.', this, url);
		}
	}

	/**
	 * Set active auth based based on navigation url.
	 * @returns navigation end event
	 */
	private _navigationEndEvent$(): Observable<any> {
		this._sb.log.trace('_onNavigationEndEvent$ fired.', this);
		return this._sb.router.events.pipe(
			startWith(this._setActiveAuthTypeBasedOnUrl(this._sb.router.url)),
			// we need to always respond to route events when this component is loaded.
			// That's what loads sign-in/sign-up/forgot-password etc components based on the current url.
			tap((event) => {
				if (event instanceof NavigationEnd) {
					this._setActiveAuthTypeBasedOnUrl(event.url);
				}
			})
		);
	}

	/**
	 * Listens to server errors and sets problem details and internal server error details.
	 */
	private _listenForServerErrors$(): Observable<ProblemDetails | InternalServerErrorDetails> {
		this._sb.log.trace('_listenForServerErrors$ fired.', this);
		return merge(this._problemDetails$, this._internalServerErrorDetails$).pipe(
			tap(() => {
				this._sb.signingInUserInProgress({ signingInUserInProgress: false });
			})
		);
	}

	/**
	 * Notifies the store that user is no longer in the process of signing in.
	 * @returns signing user in$
	 */
	private _stopSigningUserIn$(): Observable<any> {
		this._sb.log.trace('_stopSigningUserIn$ fired.', this);
		return merge(this._twoStepVerificationCancelled$, this._signInActionCompleted$).pipe(
			tap(() => {
				this._sb.signingInUserInProgress({ signingInUserInProgress: false });
			})
		);
	}

	/**
	 * Listens if two step verification is required.
	 * @returns is two step verification required$
	 */
	private _listenIfTwoStepVerificationRequired$(): Observable<any> {
		this._sb.log.trace('_listenIfTwoStepVerificationRequired$ fired.', this);
		return combineLatest(this._isTwoStepVerificationRequired$, this._twoStepVerificationEmail$, this._twoStepVerificationProvider$).pipe(
			tap(([isRequired, email, provider]: [boolean, string, string]) => {
				if (isRequired && email && provider) {
					void this._sb.router.navigate(['two-step-verification'], { relativeTo: this._route.parent, queryParams: { provider, email } });
				}
			})
		);
	}
}
