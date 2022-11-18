/* eslint-disable @typescript-eslint/member-ordering */
import { BreakpointState } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, UntypedFormGroup } from '@angular/forms';
import { ROUTE_ANIMATIONS_ELEMENTS } from 'app/core/core.module';
import { LogService } from 'app/core/logger/log.service';
import { ActiveAuthType } from 'app/core/models/auth/active-auth-type.model';
import { PasswordHelpToggleClass } from 'app/core/models/auth/password-help-toggle-class.model';
import { PasswordRequirement } from 'app/core/models/auth/password-requirement.model';
import { SignupUser } from 'app/core/models/auth/signup-user.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { ODM_SMALL_SPINNER_DIAMETER, ODM_SMALL_SPINNER_STROKE_WIDTH } from 'app/shared/global-settings/mat-spinner-settings';
import { TranslateValidationErrorsService } from 'app/shared/services/translate-validation-errors.service';
import { Subscription } from 'rxjs';
import { AuthBase } from '../auth-base';

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
		this.log.debug('Problem details emitted.', this);
		this._signingUp = false;
		this.problemDetailsError = value;
	}

	/**
	 * Emitted when server responds with 50X error.
	 */
	@Input() set internalServerErrorDetails(value: InternalServerErrorDetails) {
		this.log.debug('Internal server error emitted.', this);
		this._signingUp = false;
		this.internalServerError = value;
	}

	/**
	 * Signup form of auth component.
	 */
	@Input() set signupForm(value: UntypedFormGroup) {
		this.log.debug('Signup form emitted.', this);
		this._signupForm = value;
		this._passwordControl = value.get('password');
	}

	/**
	 * Signup form of auth component.
	 */
	_signupForm: UntypedFormGroup;

	/**
	 * Password control of sign up component.
	 */
	_passwordControl: AbstractControl;

	/**
	 * Whether to show overlay. Used for desktop view
	 */
	@Input() matcher: BreakpointState;

	/**
	 * Password requirements.
	 */
	@Input() passwordRequirements: PasswordRequirement[];

	/**
	 * Whether sign-in or sign-up component is active.
	 */
	@Input() activeAuthType: ActiveAuthType = 'sign-up-active';

	/**
	 * Password help toggle class.
	 */
	@Input() passwordHelpToggleClass: PasswordHelpToggleClass;

	/**
	 * Event emitter for when the signup form is submitted.
	 */
	@Output() signupFormSubmitted = new EventEmitter<SignupUser>();

	/**
	 * Event emitter for when user toggles password help menu.
	 */
	@Output() passwordHelpToggled = new EventEmitter<void>();

	/**
	 * Event emitter for when user clicks sign up button.
	 */
	@Output() switchToSigninClicked = new EventEmitter<ActiveAuthType>();

	/**
	 * Requires user to enter the same password for confirm password field.
	 */
	@Input() confirmPasswordMatchReqMet: boolean;

	/**
	 * Whether user is currently in the middle if signing up.
	 */
	_signingUp = false;

	/**
	 * Hide/show password.
	 */
	_hidePassword = true;

	/**
	 * Hide/show confirm password.
	 */
	_hideConfirmPassword = true;

	/**
	 * Route animations.
	 */
	readonly _routeAnimationsElements = ROUTE_ANIMATIONS_ELEMENTS;

	/**
	 * Signing up spinner diameter.
	 */
	readonly _signingUpSpinnerDiameter = ODM_SMALL_SPINNER_DIAMETER;

	/**
	 * Signing up spinner stroke width.
	 */
	readonly _signingUpSpinnerStrokeWidth = ODM_SMALL_SPINNER_STROKE_WIDTH;

	/**
	 * Rxjs subscriptions for this component.
	 */
	private readonly _subscription: Subscription = new Subscription();

	/**
	 * Creates an instance of sign up component.
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
	}

	/**
	 * NgOnDestroy life cycle.
	 */
	ngOnDestroy(): void {
		this.log.trace('Destroyed.', this);
		this._subscription.unsubscribe();
	}

	/**
	 * Event handler for when new user is attempting to sign up.
	 */
	_onSignup(): void {
		this.log.trace('onSignup event handler emitted.', this);
		const model = this._signupForm.value as SignupUser;
		this._signingUp = true;
		this.signupFormSubmitted.emit(model);
	}

	/**
	 * Event handler when user toggles password help.
	 */
	_onPasswordHelpToggled(): void {
		this.log.trace('_onPasswordHelpToggled fired.', this);
		this.passwordHelpToggled.emit();
	}

	/**
	 * Used to switch view to signin context.
	 */
	_switchToSignin(): void {
		this.log.trace('_switchToSignin fired.', this);
		this.switchToSigninClicked.emit('sign-in-active');
		// allow for the animation before cleaning up the form.
		setTimeout(() => {
			this.internalServerErrorDetails = null;
		}, 600);
	}
}
