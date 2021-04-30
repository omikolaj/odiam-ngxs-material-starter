import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AsyncValidatorsService } from 'app/core/form-validators/validators-async.service';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { FormGroup } from '@angular/forms';
import { MinScreenSizeQuery } from 'app/shared/screen-size-queries';
import { OdmValidators, MinPasswordLength } from 'app/core/form-validators/odm-validators';
import { rightLeftFadeInAnimation } from 'app/core/core.module';
import { AuthSandboxService } from '../auth-sandbox.service';
import { SignupUser } from 'app/core/models/auth/signup-user.model';
import { ActiveAuthType } from 'app/core/models/auth/active-auth-type.model';
import { AuthTypeRouteUrl } from 'app/core/models/auth/auth-type-route-url.model';
import { PasswordRequirement } from 'app/core/models/auth/password-requirement.model';

import { getPasswordRequirements } from 'app/core/utilities/password-requirements.utility';

/**
 * Sign up container component.
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
	 * Password requirements required for new user.
	 */
	_passwordRequirements: PasswordRequirement[] = [];

	/**
	 * Creates an instance of sign up container component.
	 * @param _sb
	 * @param _asyncValidators
	 * @param breakpointObserver
	 */
	constructor(private _sb: AuthSandboxService, private _asyncValidators: AsyncValidatorsService, breakpointObserver: BreakpointObserver) {
		this._problemDetails$ = _sb.problemDetails$;
		this._internalServerErrorDetails$ = _sb.internalServerErrorDetails$;
		this._breakpointStateScreenMatcher$ = breakpointObserver.observe([MinScreenSizeQuery.md]);
		this._activeAuthType$ = _sb.activeAuthType$;
	}

	/**
	 * NgOnInit life cycle.
	 */
	ngOnInit(): void {
		this._sb.log.trace('Initialized.', this);
		this._initForms();
		this._passwordRequirements = this._initPasswordRequirements();
	}

	/**
	 * Event handler for when user signs up.
	 * @param model
	 */
	_onSignupSubmitted(model: SignupUser): void {
		this._sb.log.trace('_onSignupSubmitted event handler fired.', this);
		this._sb.signupUser(model);
	}

	/**
	 * Event handler for when user signs in with google.
	 */
	_onSigninWithGoogleSubmitted(): void {
		this._sb.log.trace('_onSigninWithGoogleSubmitted event handler fired.', this);
		this._sb.signinUserWithGoogle();
	}

	/**
	 * Event handler for when user signs in with facebook.
	 */
	_onSigninWithFacebookSubmitted(): void {
		this._sb.log.trace('_onSigninWithFacebookSubmitted event handler fired.', this);
		this._sb.signinUserWithFacebook();
	}

	/**
	 * Used to switch view to signin context.
	 */
	_onSwitchToSigninClicked(event: ActiveAuthType): void {
		this._sb.log.trace('_switchToSignup fired.', this);
		const activeAuthType = { activeAuthType: event };
		const routeUrl: AuthTypeRouteUrl = event === 'sign-in-active' ? 'sign-in' : 'sign-up';
		this._sb.onSwitchAuth(activeAuthType, routeUrl);
	}

	/**
	 * Inits singin and signup forms.
	 */
	private _initForms(): void {
		this._signupForm = this._initSignupForm();
	}

	/**
	 * Inits new user's password requirements.
	 */
	private _initPasswordRequirements(): PasswordRequirement[] {
		return getPasswordRequirements();
	}

	/**
	 * Creates FormGroup for signup form.
	 * @returns signup form
	 */
	private _initSignupForm(): FormGroup {
		return this._sb.fb.group(
			{
				email: this._sb.fb.control('', {
					validators: [OdmValidators.required, OdmValidators.email],
					asyncValidators: [this._asyncValidators.checkIfEmailIsUnique()],
					updateOn: 'blur'
				}),
				password: this._sb.fb.control('', {
					validators: [
						OdmValidators.required,
						OdmValidators.minLength(MinPasswordLength),
						OdmValidators.requireDigit,
						OdmValidators.requireLowercase,
						OdmValidators.requireUppercase,
						OdmValidators.requireNonAlphanumeric,
						OdmValidators.requireThreeUniqueCharacters
					],
					updateOn: 'change'
				}),
				confirmPassword: this._sb.fb.control('', OdmValidators.required)
			},
			{
				validators: OdmValidators.requireConfirmPassword,
				updateOn: 'change'
			}
		);
	}
}
