/* eslint-disable @typescript-eslint/member-ordering */
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Output, EventEmitter, Input, OnDestroy } from '@angular/core';
import { tap } from 'rxjs/operators';
import { Subscription, Observable } from 'rxjs';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { FormGroup, AbstractControl } from '@angular/forms';
import { BreakpointState } from '@angular/cdk/layout';
import { AuthBase } from '../auth-base';
import { ActiveAuthType } from 'app/core/models/auth/active-auth-type.model';
import { SignupUser } from 'app/core/models/auth/signup-user.model';
import { AuthSandboxService } from '../auth-sandbox.service';
import { PasswordRequirement } from 'app/core/models/auth/password-requirement.model';

/**
 * Sign up component.
 */
@Component({
	selector: 'odm-sign-up',
	templateUrl: './sign-up.component.html',
	styleUrls: ['./sign-up.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignUpComponent extends AuthBase implements OnInit, OnDestroy {
	/**
	 * Emitted when server responds with 40X error.
	 */
	@Input() set problemDetails(value: ProblemDetails) {
		this._sb.log.debug('Problem details emitted.', this);
		this.problemDetailsError = value;
	}

	/**
	 * Emitted when server responds with 50X error.
	 */
	@Input() set internalServerErrorDetails(value: InternalServerErrorDetails) {
		this._sb.log.debug('Internal server error emitted.', this);
		this.internalServerError = value;
	}

	/**
	 * Signup form of auth component.
	 */
	@Input() set signupForm(value: FormGroup) {
		this._sb.log.debug('Signup form emitted.', this);
		this._signupForm = value;
		// this._subscription.add(this._validateFormPasswordField(value).subscribe());
		this._passwordControl = value.get('password');
		this._subscription.add(this._validateFormConfirmPasswordField(value).subscribe());
	}

	/**
	 * Signup form of auth component.
	 */
	_signupForm: FormGroup;

	/**
	 * Whether to show overlay. Used for desktop view
	 */
	@Input() matcher: BreakpointState;

	/**
	 * Password requirements.
	 */
	@Input() passwordRequrements: PasswordRequirement[];

	/**
	 * Whether sign-in or sign-up component is active.
	 */
	@Input() activeAuthType: ActiveAuthType = 'sign-up-active';

	/**
	 * Event emitter for when the signup form is submitted.
	 */
	@Output() signupFormSubmitted = new EventEmitter<SignupUser>();

	/**
	 * Event emitter for when user signs in with google.
	 */
	@Output() signinWithGoogleSubmitted = new EventEmitter<{ rememberMe: boolean }>();

	/**
	 * Event emitter for when user signs in with google.
	 */
	@Output() signinWithFacebookSubmitted = new EventEmitter<{ rememberMe: boolean }>();

	/**
	 * Event emitter for when user clicks sign up button.
	 */
	@Output() switchToSigninClicked = new EventEmitter<ActiveAuthType>();

	/**
	 * Signup form email control status changes$ of auth component.
	 */
	_signupFormEmailControlStatusChanges$: Observable<string>;

	/**
	 * Password control of sign up component.
	 */
	_passwordControl: AbstractControl;

	/**
	 * Requires user to enter the same password for confirm password field.
	 */
	_confirmPasswordMatchReqMet = false;

	/**
	 * Password help toggle class.
	 */
	_passwordHelpToggleClass: 'auth__password-field-help-on' | 'auth__password-field-help-off' = 'auth__password-field-help-off';

	/**
	 * Rxjs subscriptions for this component.
	 */
	private readonly _subscription: Subscription = new Subscription();

	/**
	 * Creates an instance of sign up component.
	 * @param _sb
	 * @param cd
	 */
	constructor(private _sb: AuthSandboxService, protected cd: ChangeDetectorRef) {
		super(_sb.translateValidationErrorService, _sb.log, cd);
	}

	/**
	 * NgOnInit life cycle.
	 */
	ngOnInit(): void {
		this._sb.log.trace('Initialized.', this);
		this._signupFormEmailControlStatusChanges$ = this._signupForm
			.get('email')
			// null out internalServerErrorDetails
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			.statusChanges.pipe(tap((_: string) => (this.internalServerErrorDetails = null)));
	}

	/**
	 * NgOnDestroy life cycle.
	 */
	ngOnDestroy(): void {
		this._sb.log.trace('Destroyed.', this);
		this._subscription.unsubscribe();
	}

	/**
	 * Event handler for when new user is attempting to sign up.
	 */
	_onSignup(): void {
		this._sb.log.trace('onSignup event handler emitted.', this);
		const model = this._signupForm.value as SignupUser;
		this.signupFormSubmitted.emit(model);
	}

	/**
	 * Event handler for when user is attempting to sign in with google.
	 */
	_onSigninWithGoogle(): void {
		this._sb.log.trace('_onSigninWithGoogle fired.', this);
		this.signinWithGoogleSubmitted.emit();
	}

	/**
	 * Event handler for when user is attempting to sign in with facebook.
	 */
	_onSigninWithFacebook(): void {
		this._sb.log.trace('_onSigninWithFacebook fired.', this);
		this.signinWithFacebookSubmitted.emit();
	}

	/**
	 * Event handler when user toggles on password help.
	 */
	_onPasswordHelpToggled(): void {
		this._sb.log.trace('_onPasswordHelpToggled fired.', this);
		if (this._passwordHelpToggleClass === 'auth__password-field-help-off') {
			this._passwordHelpToggleClass = 'auth__password-field-help-on';
		} else {
			this._passwordHelpToggleClass = 'auth__password-field-help-off';
		}
	}

	/**
	 * Used to switch view to signin context.
	 */
	_switchToSignin(): void {
		this._sb.log.trace('_switchToSignin fired.', this);
		this.switchToSigninClicked.emit('sign-in-active');
		// allow for the animation before cleaning up the form.
		setTimeout(() => {
			this.internalServerErrorDetails = null;
		}, 600);
	}

	/**
	 * Validates form confirm password field.
	 * @param form
	 * @returns form confirm password field
	 */
	private _validateFormConfirmPasswordField(form: FormGroup): Observable<any> {
		return form.valueChanges.pipe(
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			tap((_) => {
				if (form.hasError('notSame')) {
					this._confirmPasswordMatchReqMet = false;
				} else {
					this._confirmPasswordMatchReqMet = true;
				}
			})
		);
	}
}
