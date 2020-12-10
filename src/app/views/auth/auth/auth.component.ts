/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { FormGroup, ValidationErrors, AbstractControl } from '@angular/forms';
import { RegisterUserModel } from 'app/core/auth/register-user.model';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { LoginUserModel } from 'app/core/auth/login-user.model';

/**
 * Determines if control is associated with email or password form control.
 */
type SignupControlType = 'email' | 'password';

/**
 * Auth component handles displaying both sign in and sign up views.
 */
@Component({
	selector: 'odm-auth',
	templateUrl: './auth.component.html',
	styleUrls: ['./auth.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthComponent {
	/**
	 * ValidationProblemDetails for when server responds with validation error.
	 */
	@Input() set validationProblemDetails(value: ProblemDetails) {
		this._serverErrorHandled = false;
		this._validationProblemDetails = value;
	}

	/**
	 * Signin form of auth component.
	 */
	@Input() signinForm: FormGroup;

	/**
	 * Event emitter for when the signup form is submitted.
	 */
	@Output() signupFormSubmitted = new EventEmitter<RegisterUserModel>();

	/**
	 * Signup form of auth component.
	 */
	@Input() signupForm: FormGroup;

	/**
	 * Event emitter for when the signin form is submitted.
	 */
	@Output() signinFormSubmitted = new EventEmitter<LoginUserModel>();

	/**
	 * Property used to control if signin or signup view is displayed.
	 */
	_createAccount: 'right-panel-active' | '';

	/**
	 * Field is required message.
	 */
	_fieldRequiredMessage = 'This field is required.';

	/**
	 * If server error occured, this property is used to determine if the error has been handled by the component in the template.
	 */
	private _serverErrorHandled: boolean;

	/**
	 * Validation problem details used to check server side validation errors.
	 */
	private _validationProblemDetails: ProblemDetails;

	/**
	 * Creates an instance of auth component.
	 * @param cd
	 */
	constructor(private cd: ChangeDetectorRef) {}

	/**
	 * Event handler for when new user is attempting to sign up.
	 */
	_onSignup(): void {
		const registerUserModel = this.signupForm.value as RegisterUserModel;
		this.signupFormSubmitted.emit(registerUserModel);
	}

	/**
	 * Used to switch view to signup context.
	 */
	_switchToSignup(): void {
		this._createAccount = 'right-panel-active';
		// allow for the animation before cleaning up the form.
		setTimeout(() => {
			this.signinForm.reset();
			this.signinForm.clearAsyncValidators();
		}, 600);
	}

	/**
	 * Event handler for when user is attempting to sign in.
	 */
	_onSignin(): void {
		const loginUserModel = this.signinForm.value as LoginUserModel;
		this.signinFormSubmitted.emit(loginUserModel);
	}

	/**
	 * Used to switch view to signin context.
	 */
	_switchToSignin(): void {
		this._createAccount = '';
		// allow for the animation before cleaning up the form.
		setTimeout(() => {
			this.signupForm.reset();
			this.signupForm.clearAsyncValidators();
		}, 600);
	}

	/**
	 * Gets email error message.
	 * @param errors
	 * @returns email error message
	 */
	_getEmailErrorMessage(errors: ValidationErrors): string {
		if (errors['required']) {
			return this._fieldRequiredMessage;
		} else if (errors['email']) {
			return 'Invalid e-mail format.';
		} else if (errors['nonUnique']) {
			// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
			return `E-mail ${errors['nonUnique']} is taken.`;
		}
	}

	/**
	 * Gets password error message.
	 * @param errors
	 * @returns password error message
	 */
	_getPasswordErrorMessage(errors: ValidationErrors): string {
		if (errors['required']) {
			return this._fieldRequiredMessage;
		} else if (errors['number']) {
			return "Password must have at least one digit ('0'-'9').";
		} else if (errors['uppercase']) {
			return "Password must have at least one uppercase ('A'-'Z').";
		} else if (errors['lowercase']) {
			return "Password must have at least one lowercase ('a'-'z').";
		} else if (errors['nonAlphanumeric']) {
			// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
			return `Password must contain one of: ${errors['requiredNonAlphanumeric']}`;
		} else if (errors['minlength']) {
			// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
			return `Password must to be at least ${errors['minlength']['requiredLength']} characters long.`;
		} else if (errors['serverValidationError']) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return
			return errors['errorDescription'];
		}
	}

	/**
	 * Sets server validation error on the control if one occured.
	 * @param control
	 */
	private _setServerValidationError(control: AbstractControl): void {
		// if we have errors, may be redundant since the intercepter checks if errors is defined
		const errorDescriptions = Object.values(this._validationProblemDetails.errors);
		if (errorDescriptions.length > 0) {
			const firstErrorDescription = errorDescriptions[0];
			if (firstErrorDescription.length > 0) {
				const errorDescription = `Server validation error: ${firstErrorDescription[0]}`;
				control.setErrors({ serverValidationError: true, errorDescription });
			}
		}
	}

	/**
	 * Checks if the control field is invalid by also checking server side validations.
	 * @param control
	 * @param signupType
	 * @returns true if control field is invalid
	 */
	_ifControlFieldIsInvalid(control: AbstractControl, signupType: SignupControlType): boolean {
		if (control.invalid) {
			return true;
		}
		if (this._validationProblemDetails) {
			if (this._serverErrorHandled === false) {
				const errors = Object.keys(this._validationProblemDetails.errors).map((err) => err.toLocaleLowerCase());
				if (signupType === 'email') {
					if (errors.map((err) => err.toLocaleLowerCase().includes('email')).includes(true)) {
						this._serverErrorValidationHandler(control);
						return true;
					}
				} else if (signupType === 'password') {
					if (errors.map((err) => err.toLocaleLowerCase().includes('password')).includes(true)) {
						this._serverErrorValidationHandler(control);
						return true;
					}
				}
			}
		}
		return false;
	}

	/**
	 * Servers error validation handler. Sets up control for being invalid.
	 * @param control
	 */
	private _serverErrorValidationHandler(control: AbstractControl): void {
		control.markAsPristine();
		control.markAsUntouched();
		// adds error message to the control
		this._setServerValidationError(control);
		// indicates that the server error has been handled so we do not display it again
		this._serverErrorHandled = true;
		// required to display error message right away, otherwise its only displayed on blur.
		this.cd.detectChanges();
	}
}
