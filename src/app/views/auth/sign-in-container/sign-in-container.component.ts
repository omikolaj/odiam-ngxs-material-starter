import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { AuthFacadeService } from '../auth-facade.service';
import { ActivatedRoute } from '@angular/router';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Observable, Subscription } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { ROUTE_ANIMATIONS_ELEMENTS } from 'app/core/core.module';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { MinScreenSizeQuery } from 'app/shared/screen-size-queries';
import { tap } from 'rxjs/operators';
import { OdmValidators } from 'app/core/form-validators/odm-validators';
import { SigninUserModel } from 'app/core/auth/signin-user.model';

/**
 * Sign in container.
 */
@Component({
	selector: 'odm-sign-in-container',
	templateUrl: './sign-in-container.component.html',
	styleUrls: ['./sign-in-container.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignInContainerComponent implements OnInit, OnDestroy {
	/**
	 * Route animations elements of auth container component.
	 */
	_routeAnimationsElements = ROUTE_ANIMATIONS_ELEMENTS;

	/**
	 * Emitted when server responds with 40X error.
	 */
	_problemDetails$: Observable<ProblemDetails>;

	/**
	 * Emitted when server responds with 50X error.
	 */
	_internalServerErrorDetails$: Observable<InternalServerErrorDetails>;

	/**
	 * Signin form of auth component.
	 */
	_signinForm: FormGroup;

	/**
	 * Whether specified screen width was matched.
	 */
	_breakpointStateScreenMatcher$: Observable<BreakpointState>;

	/**
	 * Remember me option selected by the user.
	 */
	private _rememberMe$: Observable<boolean>;

	/**
	 * Subscriptions for this component.
	 */
	private _subscription = new Subscription();

	/**
	 * Creates an instance of sign in container component.
	 * @param facade
	 * @param asyncValidators
	 * @param route
	 * @param breakpointObserver
	 */
	constructor(private facade: AuthFacadeService, private route: ActivatedRoute, breakpointObserver: BreakpointObserver) {
		this._problemDetails$ = facade.problemDetails$;
		this._internalServerErrorDetails$ = facade.internalServerErrorDetails$;
		this._rememberMe$ = facade.rememberMe$;
		this._breakpointStateScreenMatcher$ = breakpointObserver.observe([MinScreenSizeQuery.md]);
	}

	/**
	 * NgOnInit life cycle.
	 */
	ngOnInit(): void {
		this.facade.log.trace('Initialized.', this);
		this._initForms();
		this._subscription = this._rememberMe$.pipe(tap((value) => this._signinForm.get('rememberMe').setValue(value))).subscribe();
	}

	/**
	 * NgOnDestroy life cycle.
	 */
	ngOnDestroy(): void {
		this.facade.log.trace('Destroyed.', this);
		this._subscription.unsubscribe();
	}

	/**
	 * Event handler for when user clicks forgot password.
	 */
	_onForgotPasswordClicked(): void {
		this.facade.log.trace('_onForgotPasswordClicked fired.', this);
		void this.facade.router.navigate(['forgot-password'], { relativeTo: this.route.parent });
	}

	/**
	 * Event handler for when user signs in with facebook.
	 */
	_onSigninWithFacebookSubmitted(): void {
		this.facade.log.trace('_onSigninWithFacebookSubmitted event handler fired.', this);
		this.facade.signinUserWithFacebook();
	}

	/**
	 * Event handler for when user signs in with google.
	 */
	_onSigninWithGoogleSubmitted(): void {
		this.facade.log.trace('_onSigninWithGoogleSubmitted event handler fired.', this);
		this.facade.signinUserWithGoogle();
	}

	/**
	 * Event handler for when user signs in.
	 * @param model
	 */
	_onSigninSubmitted(model: SigninUserModel): void {
		this.facade.log.trace('_onSigninSubmitted event handler fired.', this);
		this.facade.signinUser(model);
	}

	/**
	 * Event handler for when user changes remember me option.
	 * @param event
	 */
	_onRememberMeChanged(event: boolean): void {
		this.facade.log.trace('_onRememberMeChanged event handler fired.', this, event);
		this.facade.onRememberMeChanged(event);
	}

	_onSwitchToSignupClicked(event: 'right-panel-active' | ''): void {
		this.facade.log.trace('__onSwitchToSignupClicked event handler fired', this, event);
	}

	/**
	 * Inits singin form.
	 */
	private _initForms(): void {
		this._signinForm = this._initSigninForm();
	}

	/**
	 * Creates FormGroup for signin form.
	 * @returns signin form
	 */
	private _initSigninForm(): FormGroup {
		return this.facade.fb.group({
			email: this.facade.fb.control('', {
				validators: [OdmValidators.required, OdmValidators.email],
				updateOn: 'blur'
			}),
			password: this.facade.fb.control('', [OdmValidators.required]),
			rememberMe: this.facade.fb.control(false)
		});
	}
}
