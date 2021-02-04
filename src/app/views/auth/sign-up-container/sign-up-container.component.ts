import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AuthFacadeService } from '../auth-facade.service';
import { AsyncValidatorsService } from 'app/core/form-validators/validators-async.service';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { FormGroup } from '@angular/forms';
import { MinScreenSizeQuery } from 'app/shared/screen-size-queries';
import { OdmValidators } from 'app/core/form-validators/odm-validators';
import { SignupUserModel } from 'app/core/auth/signup-user.model';
import { ActivePanel } from 'app/core/auth/active-panel.model';
import { AuthTypeRouteUrl } from 'app/core/auth/auth-type-route-url.model';
import { rightLeftFadeInAnimation } from 'app/core/core.module';

/**
 * Signup component.
 */
@Component({
	selector: 'odm-sign-up-container',
	templateUrl: './sign-up-container.component.html',
	styleUrls: ['./sign-up-container.component.scss'],
	animations: [rightLeftFadeInAnimation],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignUpContainerComponent implements OnInit {
	/**
	 * Emitted when server responds with 40X error.
	 */
	_problemDetails$: Observable<ProblemDetails>;

	/**
	 * Emitted when server responds with 50X error.
	 */
	_internalServerErrorDetails$: Observable<InternalServerErrorDetails>;

	/**
	 * Signup form of auth component.
	 */
	_signupForm: FormGroup;

	/**
	 * Whether specified screen width was matched.
	 */
	_breakpointStateScreenMatcher$: Observable<BreakpointState>;

	/**
	 * Whether to display sign-in or sign-up component.
	 */
	_activeAuthType$: Observable<string>;

	/**
	 * Creates an instance of sign up container component.
	 * @param facade
	 * @param asyncValidators
	 * @param breakpointObserver
	 */
	constructor(private facade: AuthFacadeService, private asyncValidators: AsyncValidatorsService, breakpointObserver: BreakpointObserver) {
		this._problemDetails$ = facade.problemDetails$;
		this._internalServerErrorDetails$ = facade.internalServerErrorDetails$;
		this._breakpointStateScreenMatcher$ = breakpointObserver.observe([MinScreenSizeQuery.md]);
		this._activeAuthType$ = facade.activeAuthType$;
	}

	/**
	 * NgOnInit life cycle.
	 */
	ngOnInit(): void {
		this.facade.log.trace('Initialized.', this);
		this._initForms();
	}

	/**
	 * Event handler for when user signs up.
	 * @param model
	 */
	_onSignupSubmitted(model: SignupUserModel): void {
		this.facade.log.trace('_onSignupSubmitted event handler fired.', this);
		this.facade.signupUser(model);
	}

	/**
	 * Event handler for when user signs in with google.
	 */
	_onSigninWithGoogleSubmitted(): void {
		this.facade.log.trace('_onSigninWithGoogleSubmitted event handler fired.', this);
		this.facade.signinUserWithGoogle();
	}

	/**
	 * Event handler for when user signs in with facebook.
	 */
	_onSigninWithFacebookSubmitted(): void {
		this.facade.log.trace('_onSigninWithFacebookSubmitted event handler fired.', this);
		this.facade.signinUserWithFacebook();
	}

	/**
	 * Used to switch view to signup context.
	 */
	_onSwitchToSigninClicked(event: ActivePanel): void {
		this.facade.log.trace('_switchToSignup fired.', this);
		const activeAuthType = { activeAuthType: event };
		const routeUrl: AuthTypeRouteUrl = event === 'sign-in-active' ? 'sign-in' : 'sign-up';
		this.facade.onSwitchAuth(activeAuthType, routeUrl);
	}

	/**
	 * Inits singin and signup forms.
	 */
	private _initForms(): void {
		this._signupForm = this._initSignupForm();
	}

	/**
	 * Creates FormGroup for signup form.
	 * @returns signup form
	 */
	private _initSignupForm(): FormGroup {
		return this.facade.fb.group(
			{
				email: this.facade.fb.control('', {
					validators: [OdmValidators.required, OdmValidators.email],
					asyncValidators: [this.asyncValidators.checkIfEmailIsUnique()],
					updateOn: 'blur'
				}),
				password: this.facade.fb.control('', {
					validators: [
						OdmValidators.required,
						OdmValidators.minLength(8),
						OdmValidators.requireDigit,
						OdmValidators.requireLowercase,
						OdmValidators.requireUppercase,
						OdmValidators.requireNonAlphanumeric,
						OdmValidators.requireThreeUniqueCharacters
					],
					updateOn: 'change'
				}),
				confirmPassword: this.facade.fb.control('')
			},
			{
				validators: OdmValidators.requireConfirmPassword,
				updateOn: 'change'
			}
		);
	}
}
