/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef, Output, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, ValidationErrors, AbstractControl, FormGroupDirective } from '@angular/forms';
import { SignupUserModel } from 'app/core/auth/signup-user.model';
import { SigninUserModel } from 'app/core/auth/signin-user.model';
import { ROUTE_ANIMATIONS_ELEMENTS } from 'app/core/core.module';
import { tap } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { implementsOdmWebApiException } from 'app/core/utilities/implements-odm-web-api-exception';
import { LogService } from 'app/core/logger/log.service';

/**
 * Determines if control is associated with email or password form control.
 */
type AuthControlType = 'email' | 'password';

/**
 * Auth component handles displaying both sign in and sign up views.
 */
@Component({
	selector: 'odm-auth',
	templateUrl: './auth.component.html',
	styleUrls: ['./auth.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthComponent implements OnInit, OnDestroy {
	/**
	 * ProblemDetails for when server responds with validation error.
	 */
	@Input() set problemDetails(value: ProblemDetails) {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const _ = value ? this.logger.debug('Problem details emitted.', this) : null;
		this._problemDetailsServerErrorHandled = false;
		this._problemDetails = value;
	}

	/**
	 * InternalServerErrorDetails for when server crashes and responds with 500 error.
	 */
	@Input() internalServerErrorDetails: InternalServerErrorDetails;

	/**
	 * Signin form of auth component.
	 */
	@Input() signinForm: FormGroup;

	/**
	 * Event emitter for when the signup form is submitted.
	 */
	@Output() signupFormSubmitted = new EventEmitter<SignupUserModel>();

	/**
	 * Signup form of auth component.
	 */
	@Input() set signupForm(value: FormGroup) {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const _ = value ? this.logger.info('Signup form emitted.', this) : null;
		this._signupForm = value;
		this._subscription.add(this._validateSignupFormPasswordField(value).subscribe());
	}

	/**
	 * Signup form of auth component.
	 */
	_signupForm: FormGroup;

	/**
	 * Signup form email control status changes$ of auth component.
	 */
	_signupFormEmailControlStatusChanges$: Observable<any>;

	/**
	 * Event emitter for when the signin form is submitted.
	 */
	@Output() signinFormSubmitted = new EventEmitter<SigninUserModel>();

	/**
	 * Property used to control if signin or signup view is displayed.
	 */
	_createAccount: 'right-panel-active' | '';

	/**
	 * Field is required message.
	 */
	_fieldRequiredMessage = 'This field is required.';

	/**
	 * Route animations elements of auth component.
	 */
	_routeAnimationsElements = ROUTE_ANIMATIONS_ELEMENTS;

	/**
	 * Hide/show password.
	 */
	_hide = true;

	/**
	 * Password length requirement for password control.
	 * Used to inform user about password requirement.
	 */
	_passwordLengthReqMet = false;

	/**
	 * Password uppercase requirement for password control.
	 * Used to inform user about password requirement.
	 */
	_passwordUppercaseReqMet = false;

	/**
	 * Password lowercase requirement for password control.
	 * Used to inform user about password requirement.
	 */
	_passwordLowercaseReqmet = false;

	/**
	 * Password digit requirement for password control.
	 * Used to inform user about password requirement.
	 */
	_passwordDigitReqMet = false;

	/**
	 * Password special character requirement for password control.
	 * Used to inform user about password requirement.
	 */
	_passwordSpecialCharacterReqMet = false;

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
	 * If field input is invalid but the control has no errors associated with it.
	 * This serves as the generic error message.
	 */
	private _fieldIsInvalid = 'Input validation error.';

	/**
	 * If server error occured, this property is used to determine if the error has been handled by the component in the template.
	 */
	private _problemDetailsServerErrorHandled: boolean;

	/**
	 * Validation problem details used to check server side validation errors.
	 */
	private _problemDetails: ProblemDetails;

	/**
	 * Subscription of auth component.
	 */
	private _subscription: Subscription = new Subscription();

	/**
	 * Determines whether the problem details error is validation related to model validations.
	 */
	private get _isServerValidationError(): boolean {
		return !!this._problemDetails.errors;
	}

	/**
	 * Creates an instance of auth component.
	 * @param cd
	 */
	constructor(private cd: ChangeDetectorRef, private logger: LogService) {}

	/**
	 * NgOnInit life cycle.
	 */
	ngOnInit(): void {
		this._signupFormEmailControlStatusChanges$ = this._signupForm.get('email').statusChanges.pipe(
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			tap((_) => {
				if (this._isInternalServerError) {
					// null out internalServerErrorDetails when the email
					// control statusChanges. Necessary to remove old message
					// and display new one.
					this.internalServerErrorDetails = null;
				}
			})
		);
	}

	/**
	 * NgOnDestroy life cycle.
	 */
	ngOnDestroy(): void {
		this._subscription.unsubscribe();
	}

	/**
	 * Event handler for when new user is attempting to sign up.
	 */
	_onSignup(): void {
		this.logger.debug('onSignup event handler emitted.', this);
		const signupUserModel = this._signupForm.value as SignupUserModel;
		this.signupFormSubmitted.emit(signupUserModel);
	}

	/**
	 * Used to switch view to signup context.
	 */
	_switchToSignup(formDirective: FormGroupDirective): void {
		this.logger.debug('Switching to signup view.');
		this._createAccount = 'right-panel-active';
		// allow for the animation before cleaning up the form.
		setTimeout(() => {
			formDirective.resetForm();
		}, 600);
	}

	/**
	 * Event handler for when user is attempting to sign in.
	 */
	_onSignin(): void {
		this.logger.debug('onSignin event handler emitted.', this);
		const SigninUserModel = this.signinForm.value as SigninUserModel;
		this.signinFormSubmitted.emit(SigninUserModel);
	}

	/**
	 * Used to switch view to signin context.
	 */
	_switchToSignin(formDirective: FormGroupDirective): void {
		this.logger.debug('Switching to signin view.');
		this._createAccount = '';
		// allow for the animation before cleaning up the form.
		setTimeout(() => {
			this.internalServerErrorDetails = null;
			formDirective.resetForm();
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
			return `${errors['nonUnique']} is already registered.`;
		} else if (errors['serverAuthenticationError']) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return
			return errors['errorDescription'];
		} else {
			return this._fieldIsInvalid;
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
		} else if (errors['serverAuthenticationError']) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return
			return errors['errorDescription'];
		} else {
			return this._fieldIsInvalid;
		}
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
	 * Sets server validation error on the control if one occured.
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

	/**
	 * Validates signup form password field.
	 * @param form
	 * @returns signup form password field
	 */
	private _validateSignupFormPasswordField(form: FormGroup): Observable<any> {
		const passwordControl = form.get('password');
		return passwordControl.valueChanges.pipe(
			tap((value: string) => {
				if (passwordControl.hasError('number')) {
					this._passwordDigitReqMet = false;
				} else {
					this._passwordDigitReqMet = true;
				}
				if (passwordControl.hasError('uppercase')) {
					this._passwordUppercaseReqMet = false;
				} else {
					this._passwordUppercaseReqMet = true;
				}
				if (passwordControl.hasError('lowercase')) {
					this._passwordLowercaseReqmet = false;
				} else {
					this._passwordLowercaseReqmet = true;
				}
				if (passwordControl.hasError('nonAlphanumeric')) {
					this._passwordSpecialCharacterReqMet = false;
				} else {
					this._passwordSpecialCharacterReqMet = true;
				}
				if ((value || '').length === 0 || passwordControl.hasError('minlength')) {
					this._passwordLengthReqMet = false;
				} else if (passwordControl.errors && !passwordControl.errors['minlength'] && passwordControl.hasError('minlength') === false) {
					this._passwordLengthReqMet = true;
				}
			})
		);
	}
}
