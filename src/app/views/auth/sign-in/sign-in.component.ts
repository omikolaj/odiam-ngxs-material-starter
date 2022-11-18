import { BreakpointState } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ROUTE_ANIMATIONS_ELEMENTS } from 'app/core/core.module';
import { LogService } from 'app/core/logger/log.service';
import { ActiveAuthType } from 'app/core/models/auth/active-auth-type.model';
import { SigninUser } from 'app/core/models/auth/signin-user.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { ODM_SMALL_SPINNER_DIAMETER, ODM_SMALL_SPINNER_STROKE_WIDTH } from 'app/shared/global-settings/mat-spinner-settings';
import { TranslateValidationErrorsService } from 'app/shared/services/translate-validation-errors.service';
import { AuthBase } from '../auth-base';

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
		this.log.debug('Problem details emitted.', this);
		this.problemDetailsError = value;
	}

	/**
	 * Emitted when server responds with 50X error.
	 */
	@Input() set internalServerErrorDetails(value: InternalServerErrorDetails) {
		this.log.debug('Internal server error emitted.', this);
		this.internalServerError = value;
	}

	/**
	 * Signin form of auth component.
	 */
	@Input() signinForm: UntypedFormGroup;

	/**
	 * Whether to show overlay. Used for desktop view
	 */
	@Input() matcher: BreakpointState;

	/**
	 * Whether sign-in or sign-up component is active.
	 */
	@Input() activeAuthType: ActiveAuthType = 'sign-in-active';

	/**
	 * Whether to remember username.
	 */
	@Input() rememberMe = false;

	/**
	 * Username value. Empty string if remember me is false.
	 */
	@Input() set username(value: string) {
		this.log.debug('Setting email value for signin form.', this, value);
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
	 * Event emitter for when the signin form is submitted.
	 */
	@Output() signinFormSubmitted = new EventEmitter<SigninUser>();

	/**
	 * Event emitter for when user clicks forgot password.
	 */
	@Output() forgotPasswordClicked = new EventEmitter<void>();

	/**
	 * Event emitter for when user clicks sign up button.
	 */
	@Output() switchToSignupClicked = new EventEmitter<ActiveAuthType>();

	/**
	 * Whether user is currently in the middle if signing in.
	 */
	@Input() signingIn: boolean;

	/**
	 * Hide/show password.
	 */
	_hide = true;

	/**
	 * Route animations.
	 */
	readonly _routeAnimationsElements = ROUTE_ANIMATIONS_ELEMENTS;

	/**
	 * Signing in spinner diameter.
	 */
	readonly _signingInSpinnerDiameter = ODM_SMALL_SPINNER_DIAMETER;

	/**
	 * Signing in spinner stroke width.
	 */
	readonly _signingInSpinnerStrokeWidth = ODM_SMALL_SPINNER_STROKE_WIDTH;

	/**
	 * Creates an instance of sign in component.
	 * @param _sb
	 * @param cd
	 */
	constructor(
		protected translateValidationErrorService: TranslateValidationErrorsService,
		protected log: LogService,
		protected cd: ChangeDetectorRef
	) {
		super(translateValidationErrorService, log, cd);
	}

	/**
	 * NgOnInit life cycle.
	 */
	ngOnInit(): void {
		this.log.trace('Initialized.', this);
		this.signinForm.get('rememberMe').setValue(this.rememberMe);
		this.signinForm.get('email').setValue(this._username);
	}

	/**
	 * Event handler for when user clicks forgot password button.
	 */
	_onForgotPassword(): void {
		this.log.trace('_onForgotPassword event handler fired.', this);
		this.forgotPasswordClicked.emit();
	}

	/**
	 * Event handler for when remember me option is changed.
	 * @param event
	 */
	_onRememberMeChange(event: MatSlideToggleChange): void {
		this.log.trace('_onRememberMeChange event handler emitted.', this);
		this.rememberMeChanged.emit(event.checked);
	}

	/**
	 * Event handler for when user is attempting to sign in.
	 */
	_onSignin(): void {
		this.log.trace('_onSignin event handler fired.', this);
		const signinUserModel = this.signinForm.value as SigninUser;
		this.signinFormSubmitted.emit(signinUserModel);
	}

	/**
	 * Used to switch view to signup context.
	 */
	_switchToSignup(): void {
		this.log.trace('_switchToSignup event handler fired.', this);
		this.switchToSignupClicked.emit('sign-up-active');
	}

	/**
	 * Disables signin if either email control is empty or password control is empty.
	 * @returns true if button should be disabled
	 */
	_disableSignin(): boolean {
		const emailControl = this.signinForm?.get('email');
		const passwordControl = this.signinForm?.get('password');
		return emailControl.value === '' || passwordControl.value === '';
	}
}
