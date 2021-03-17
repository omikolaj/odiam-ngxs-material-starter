import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SigninUser } from 'app/core/auth/models/signin-user.model';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { BreakpointState } from '@angular/cdk/layout';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ROUTE_ANIMATIONS_ELEMENTS } from 'app/core/core.module';
import { ActiveAuthType } from 'app/core/auth/models/active-auth-type.model';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { AuthBase } from '../auth-base';
import { AuthFacadeService } from '../auth-facade.service';

/**
 * Sign in component.
 */
@Component({
	selector: 'odm-sign-in',
	templateUrl: './sign-in.component.html',
	styleUrls: ['./sign-in.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignInComponent extends AuthBase implements OnInit {
	/**
	 * Emitted when server responds with 40X error.
	 */
	@Input() set problemDetails(value: ProblemDetails) {
		this.facade.log.debug('Problem details emitted.', this);
		this._problemDetailsServerErrorHandled = false;
		// when problem details emits, clear out internal server error.
		this._internalServerErrorDetails = null;
		this._problemDetails = value;
	}

	/**
	 * Emitted when server responds with 50X error.
	 */
	@Input() set internalServerErrorDetails(value: InternalServerErrorDetails) {
		this.facade.log.debug('Internal server error emitted.', this);
		this._internalServerErrorDetailsHandled = false;
		// when internal server error emits, clear out problem details.
		this._problemDetails = null;
		this._internalServerErrorDetails = value;
	}

	/**
	 * Signin form of auth component.
	 */
	@Input() signinForm: FormGroup;

	/**
	 * Whether to show overlay. Used for desktop view
	 */
	@Input() matcher: BreakpointState;

	/**
	 * Whether sign-in or sign-up component is active.
	 */
	@Input() activeAuthType: ActiveAuthType = 'sign-in-active';

	/**
	 * Whether to keep user signed in and automatically refresh the session.
	 */
	@Input() staySignedIn = false;

	/**
	 * Whether to remember username.
	 */
	@Input() rememberMe = false;

	/**
	 * Username value. Empty string if remember me is false.
	 */
	@Input() set username(value: string) {
		this.facade.log.debug('Setting email value for signin form.', this, value);
		this._username = value;
		// in case we fetch user's email from the server. Ensures fresh copy is reflected in the UI.
		// if value is truthy set it, else we dont care to update the form.
		if (this.signinForm && value) {
			this.signinForm.get('email').setValue(value);
		}
	}

	private _username = '';

	/**
	 * Event emitter for when remember me option is changed.
	 */
	@Output() rememberMeChanged = new EventEmitter<boolean>();

	/**
	 * Event emitter for when stay signed in option is changed.
	 */
	@Output() staySignedinChanged = new EventEmitter<boolean>();

	/**
	 * Event emitter for when the signin form is submitted.
	 */
	@Output() signinFormSubmitted = new EventEmitter<SigninUser>();

	/**
	 * Event emitter for when user signs in with google.
	 */
	@Output() signinWithGoogleSubmitted = new EventEmitter<{ staySignedIn: boolean }>();

	/**
	 * Event emitter for when user signs in with google.
	 */
	@Output() signinWithFacebookSubmitted = new EventEmitter<{ staySignedIn: boolean }>();

	/**
	 * Event emitter for when user clicks forgot password.
	 */
	@Output() forgotPasswordClicked = new EventEmitter<void>();

	/**
	 * Event emitter for when user clicks sign up button.
	 */
	@Output() switchToSignupClicked = new EventEmitter<ActiveAuthType>();

	/**
	 * Route animations elements of auth container component.
	 */
	_routeAnimationsElements = ROUTE_ANIMATIONS_ELEMENTS;

	/**
	 * Label position of stay signed in checkbox.
	 */
	_labelPosition: 'before' | 'after' = 'after';

	/**
	 * Creates an instance of sign in component.
	 * @param translateError
	 * @param log
	 * @param cd
	 */
	constructor(private facade: AuthFacadeService, cd: ChangeDetectorRef) {
		super(facade.translateValidationErrorService, facade.log, cd);
	}

	/**
	 * NgOnInit life cycle.
	 */
	ngOnInit(): void {
		this.facade.log.trace('Initialized.', this);
		this.signinForm.get('rememberMe').setValue(this.rememberMe);
		this.signinForm.get('staySignedIn').setValue(this.staySignedIn);
		this.signinForm.get('email').setValue(this._username);
	}

	/**
	 * Event handler for when user clicks forgot password button.
	 */
	_onForgotPassword(): void {
		this.facade.log.trace('_onForgotPassword event handler fired.', this);
		this.forgotPasswordClicked.emit();
	}

	/**
	 * Event handler for when remember me option is changed.
	 * @param event
	 */
	_onRememberMeChange(event: MatSlideToggleChange): void {
		this.facade.log.trace('_onRememberMeChange event handler emitted.', this);
		this.rememberMeChanged.emit(event.checked);
	}

	/**
	 * Event handler for when stay signed in options is changed.
	 * @param event
	 */
	_onStaySignedInChange(event: MatCheckboxChange): void {
		this.facade.log.trace('_onStaySignedInChange event handler fired.', this);
		this.staySignedinChanged.emit(event.checked);
	}

	/**
	 * Event handler for when user is attempting to sign in.
	 */
	_onSignin(): void {
		this.facade.log.trace('_onSignin event handler fired.', this);
		const signinUserModel = this.signinForm.value as SigninUser;
		this.signinFormSubmitted.emit(signinUserModel);
	}

	/**
	 * Event handler for when user is attempting to sign in with google.
	 */
	_onSigninWithGoogle(): void {
		this.facade.log.trace('_onSigninWithGoogle event handler fired.', this);
		const staySignedIn = (this.signinForm.value as SigninUser).staySignedIn;
		this.signinWithGoogleSubmitted.emit({ staySignedIn });
	}

	/**
	 * Event handler for when user is attempting to sign in with facebook.
	 */
	_onSigninWithFacebook(): void {
		this.facade.log.trace('_onSigninWithFacebook event handler fired.', this);
		const staySignedIn = (this.signinForm.value as SigninUser).staySignedIn;
		this.signinWithFacebookSubmitted.emit({ staySignedIn });
	}

	/**
	 * Used to switch view to signup context.
	 */
	_switchToSignup(): void {
		this.facade.log.trace('_switchToSignup event handler fired.', this);
		this.switchToSignupClicked.emit('sign-up-active');
	}
}
