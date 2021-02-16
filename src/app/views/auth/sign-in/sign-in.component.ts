import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormGroup, ValidationErrors, AbstractControl } from '@angular/forms';
import { SigninUser } from 'app/core/auth/signin-user.model';
import { ValidationMessage_Required } from 'app/shared/validation-messages';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { BreakpointState } from '@angular/cdk/layout';
import { implementsOdmWebApiException } from 'app/core/utilities/implements-odm-web-api-exception';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { LogService } from 'app/core/logger/log.service';
import { TranslateErrorsService } from 'app/shared/services/translate-errors.service';
import { Observable } from 'rxjs';
import { AuthControlType } from 'app/shared/auth-abstract-control-type';
import { ROUTE_ANIMATIONS_ELEMENTS } from 'app/core/core.module';
import { ActiveAuthType } from 'app/core/auth/active-auth-type.model';
import { MatCheckboxChange } from '@angular/material/checkbox';

/**
 * Sign in component.
 */
@Component({
	selector: 'odm-sign-in',
	templateUrl: './sign-in.component.html',
	styleUrls: ['./sign-in.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignInComponent implements OnInit {
	/**
	 * Emitted when server responds with 40X error.
	 */
	@Input() set problemDetails(value: ProblemDetails) {
		this.log.debug('Problem details emitted.', this);
		this._problemDetailsServerErrorHandled = false;
		this._problemDetails = value;
	}

	private _problemDetails: ProblemDetails;

	/**
	 * Emitted when server responds with 50X error.
	 */
	@Input() internalServerErrorDetails: InternalServerErrorDetails;

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
		this._username = value;
		// in case we fetch user's email from the server. Ensures fresh copy is reflected in the UI.
		if (this.signinForm) {
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
	 * Hide/show password.
	 */
	_hide = true;

	/**
	 * Field is required message.
	 */
	_fieldRequiredMessage = ValidationMessage_Required;

	/**
	 * Route animations elements of auth container component.
	 */
	_routeAnimationsElements = ROUTE_ANIMATIONS_ELEMENTS;

	/**
	 * Facebook login icon.
	 */
	_facebookLoginIcon = (require('../../../../assets/facebook_icon_color.svg') as { default: string }).default;

	/**
	 * Google login icon.
	 */
	_googleLoginIcon = (require('../../../../assets/google_icon_color.svg') as { default: string }).default;

	/**
	 * Label position of stay signed in checkbox.
	 */
	_labelPosition: 'before' | 'after' = 'after';

	/**
	 * Gets whether is internal server error occured.
	 */
	get _isInternalServerError(): boolean {
		return !!this.internalServerErrorDetails;
	}

	/**
	 * Checks if internal server error implements problem details
	 */
	private get _doesInternalServerErrorImplementOdmWebApiException(): boolean {
		return implementsOdmWebApiException(this.internalServerErrorDetails);
	}

	/**
	 * If server error occured, this property is used to determine if the error has been handled by the component in the template.
	 */
	private _problemDetailsServerErrorHandled: boolean;

	/**
	 * Determines whether the problem details error is validation related to model validations.
	 */
	private get _isServerValidationError(): boolean {
		return !!this._problemDetails.errors;
	}

	/**
	 * Creates an instance of sign in component.
	 * @param translateError
	 * @param log
	 * @param cd
	 */
	constructor(private translateError: TranslateErrorsService, private log: LogService, private cd: ChangeDetectorRef) {}

	/**
	 * NgOnInit life cycle.
	 */
	ngOnInit(): void {
		this.signinForm.get('rememberMe').setValue(this.rememberMe);
		this.signinForm.get('staySignedIn').setValue(this.staySignedIn);
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
	 * Event handler for when stay signed in options is changed.
	 * @param event
	 */
	_onStaySignedInChange(event: MatCheckboxChange): void {
		this.log.trace('_onStaySignedInChange event handler fired.', this);
		this.staySignedinChanged.emit(event.checked);
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
	 * Event handler for when user is attempting to sign in with google.
	 */
	_onSigninWithGoogle(): void {
		this.log.trace('_onSigninWithGoogle event handler fired.', this);
		const staySignedIn = (this.signinForm.value as SigninUser).staySignedIn;
		this.signinWithGoogleSubmitted.emit({ staySignedIn });
	}

	/**
	 * Event handler for when user is attempting to sign in with facebook.
	 */
	_onSigninWithFacebook(): void {
		this.log.trace('_onSigninWithFacebook event handler fired.', this);
		const staySignedIn = (this.signinForm.value as SigninUser).staySignedIn;
		this.signinWithFacebookSubmitted.emit({ staySignedIn });
	}

	/**
	 * Used to switch view to signup context.
	 */
	_switchToSignup(): void {
		this.log.trace('_switchToSignup event handler fired.', this);
		this.switchToSignupClicked.emit('sign-up-active');
	}

	/**
	 * Gets translated error message.
	 * @param errors
	 * @returns translated error message$
	 */
	_getTranslatedErrorMessage$(errors: ValidationErrors): Observable<string> {
		return this.translateError.translateErrorMessage$(errors);
	}

	/**
	 * Gets internal server error message.
	 * @returns internal server error message
	 */
	_getInternalServerErrorMessage(): string {
		let errorDescription = '';
		if (this._doesInternalServerErrorImplementOdmWebApiException) {
			errorDescription = this.internalServerErrorDetails.detail;
		} else {
			errorDescription = this.internalServerErrorDetails.message;
		}
		return errorDescription;
	}

	/**
	 * Checks if the control was invalidated by the server.
	 * This will only happen if angular form validations were somehow passed.
	 * @param control
	 * @param controlType
	 * @returns true if control field is invalidated by server
	 */
	_ifControlFieldIsInvalidatedByServer(control: AbstractControl, controlType: AuthControlType): boolean {
		if (this._problemDetails) {
			if (this._problemDetailsServerErrorHandled === false) {
				if (this._isServerValidationError) {
					const errors = Object.keys(this._problemDetails.errors).map((err) => err.toLocaleLowerCase());
					if (controlType === 'email') {
						if (errors.map((err) => err.includes('email')).includes(true)) {
							return this._setAndHandleServerValidationError(control);
						}
					} else if (controlType === 'password') {
						if (errors.map((err) => err.includes('password')).includes(true)) {
							return this._setAndHandleServerValidationError(control);
						}
					}
				} else if (this._isServerValidationError === false && control.pristine === false) {
					this._setServerLoginError(control);
					this._abstractControlServerErrorHandler(control);

					return true;
				}
			}
		}

		return false;
	}

	/**
	 * Checks if the control field is invalid by also checking server side validations.
	 * @param control
	 * @param controlType
	 * @returns true if control field is invalid
	 */
	_ifControlFieldIsInvalid(control: AbstractControl, controlType: AuthControlType): boolean {
		if (control.invalid) {
			return true;
		} else {
			return this._ifControlFieldIsInvalidatedByServer(control, controlType);
		}
	}

	/**
	 * Sets server validation error on the control.
	 * @param control
	 */
	private _setServerValidationError(control: AbstractControl): void {
		// if we have errors, may be redundant since the intercepter checks if errors is defined
		const errorDescriptions = Object.values(this._problemDetails.errors);
		if (errorDescriptions.length > 0) {
			const firstErrorDescription = errorDescriptions[0];
			if (firstErrorDescription.length > 0) {
				const errorDescription = `Server validation error: ${firstErrorDescription[0]}`;
				control.setErrors({ serverValidationError: true, errorDescription });
			}
		}
	}

	/**
	 * Sets server login error on the passed in control.
	 * @param control
	 */
	private _setServerLoginError(control: AbstractControl): void {
		const errorDescription = this._problemDetails.detail;
		control.setErrors({ serverAuthenticationError: true, errorDescription });
	}

	/**
	 * Sets and handles server validation error for the given control.
	 * @param control
	 * @returns true to indicate the control is invalid
	 */
	private _setAndHandleServerValidationError(control: AbstractControl): boolean {
		// adds error message to the control
		this._setServerValidationError(control);
		this._abstractControlServerErrorHandler(control);
		// return true to indicate the control is invalid with server validatione rrors
		return true;
	}

	/**
	 * Servers error validation handler. Sets up control for being invalid.
	 * @param control
	 */
	private _abstractControlServerErrorHandler(control: AbstractControl): void {
		control.markAsPristine();
		control.markAsUntouched();
		this._problemDetailsServerErrorHandled = true;

		// required to display error message right away, otherwise its only displayed on blur.
		this.cd.detectChanges();
	}
}
