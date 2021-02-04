import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Output, EventEmitter, Input, OnDestroy } from '@angular/core';
import { AuthFacadeService } from '../auth-facade.service';
import { tap } from 'rxjs/operators';
import { SignupUserModel } from 'app/core/auth/signup-user.model';
import { implementsOdmWebApiException } from 'app/core/utilities/implements-odm-web-api-exception';
import { Subscription, Observable } from 'rxjs';
import { ValidationMessage_Required } from 'app/shared/validation-messages';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { FormGroup, ValidationErrors, AbstractControl } from '@angular/forms';
import { BreakpointState } from '@angular/cdk/layout';
import { AuthControlType } from 'app/shared/auth-abstract-control-type';
import { ActivePanel } from 'app/core/auth/active-panel.model';

/**
 * Signup component.
 */
@Component({
	selector: 'odm-sign-up',
	templateUrl: './sign-up.component.html',
	styleUrls: ['./sign-up.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignUpComponent implements OnInit, OnDestroy {
	/**
	 * Emitted when server responds with 40X error.
	 */
	@Input() set problemDetails(value: ProblemDetails) {
		this.facade.log.debug('Problem details emitted.', this);
		this._problemDetailsServerErrorHandled = false;
		this._problemDetails = value;
	}

	private _problemDetails: ProblemDetails;

	/**
	 * Emitted when server responds with 50X error.
	 */
	@Input() internalServerErrorDetails: InternalServerErrorDetails;

	/**
	 * Signup form of auth component.
	 */
	@Input() set signupForm(value: FormGroup) {
		this.facade.log.debug('Signup form emitted.', this);
		this._signupForm = value;
		this._subscription.add(this._validateSignupFormPasswordField(value).subscribe());
		this._subscription.add(this._validateSignupFormConfirmPasswordField(value).subscribe());
	}

	/**
	 * Whether to show overlay. Used for desktop view
	 */
	@Input() matcher: BreakpointState;

	/**
	 * Signup form of auth component.
	 */
	_signupForm: FormGroup;

	/**
	 * Whether sign-in or sign-up component is active.
	 */
	@Input() activeAuthType: ActivePanel = 'sign-up-active';

	/**
	 * Event emitter for when the signup form is submitted.
	 */
	@Output() signupFormSubmitted = new EventEmitter<SignupUserModel>();

	/**
	 * Event emitter for when user signs in with google.
	 */
	@Output() signinWithGoogleSubmitted = new EventEmitter<void>();

	/**
	 * Event emitter for when user signs in with google.
	 */
	@Output() signinWithFacebookSubmitted = new EventEmitter<void>();

	/**
	 * Event emitter for when user clicks sign up button.
	 */
	@Output() switchToSigninClicked = new EventEmitter<ActivePanel>();

	/**
	 * Signup form email control status changes$ of auth component.
	 */
	_signupFormEmailControlStatusChanges$: Observable<string>;

	/**
	 * Field is required message.
	 */
	_fieldRequiredMessage = ValidationMessage_Required;

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
	_passwordLowercaseReqMet = false;

	/**
	 * Password digit requirement for password control.
	 * Used to inform user about password requirement.
	 */
	_passwordDigitReqMet = false;

	/**
	 * Requires user to enter in at least three unique characters.
	 */
	_passwordThreeUniqueCharacterCountReqMet = false;

	/**
	 * Password special character requirement for password control.
	 * Used to inform user about password requirement.
	 */
	_passwordSpecialCharacterReqMet = false;

	/**
	 * Requires user to enter the same password for confirm password field.
	 */
	_confirmPasswordNotMatchReqMet = false;

	/**
	 * Facebook login icon.
	 */
	_facebookLoginIcon = (require('../../../../assets/facebook_icon_color.svg') as { default: string }).default;

	/**
	 * Google login icon.
	 */
	_googleLoginIcon = (require('../../../../assets/google_icon_color.svg') as { default: string }).default;

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
	 * Subscriptions for this component.
	 */
	private _subscription: Subscription = new Subscription();

	/**
	 * Determines whether the problem details error is validation related to model validations.
	 */
	private get _isServerValidationError(): boolean {
		return !!this._problemDetails.errors;
	}

	/**
	 * Creates an instance of sign up component.
	 * @param facade
	 * @param cd
	 */
	constructor(private facade: AuthFacadeService, private cd: ChangeDetectorRef) {}

	/**
	 * NgOnInit life cycle.
	 */
	ngOnInit(): void {
		this.facade.log.trace('Initialized.', this);
		this._signupFormEmailControlStatusChanges$ = this._signupForm.get('email').statusChanges.pipe(
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			tap((_: string) => {
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
		this.facade.log.trace('Destroyed.', this);
		this._subscription.unsubscribe();
	}

	/**
	 * Event handler for when new user is attempting to sign up.
	 */
	_onSignup(): void {
		this.facade.log.trace('onSignup event handler emitted.', this);
		const model = this._signupForm.value as SignupUserModel;
		this.signupFormSubmitted.emit(model);
	}

	/**
	 * Event handler for when user is attempting to sign in with google.
	 */
	_onSigninWithGoogle(): void {
		this.facade.log.trace('_onSigninWithGoogle fired.', this);
		this.signinWithGoogleSubmitted.emit();
	}

	/**
	 * Event handler for when user is attempting to sign in with facebook.
	 */
	_onSigninWithFacebook(): void {
		this.facade.log.trace('_onSigninWithFacebook fired.', this);
		this.signinWithFacebookSubmitted.emit();
	}

	/**
	 * Used to switch view to signin context.
	 */
	_switchToSignin(): void {
		this.facade.log.trace('_switchToSignin fired.', this);
		this.switchToSigninClicked.emit('sign-in-active');
		// allow for the animation before cleaning up the form.
		setTimeout(() => {
			this.internalServerErrorDetails = null;
			// formDirective.resetForm();
		}, 600);
	}

	/**
	 * Gets translated error message.
	 * @param errors
	 * @returns translated error message$
	 */
	_getTranslatedErrorMessage$(errors: ValidationErrors): Observable<string> {
		return this.facade.translateError.translateErrorMessage$(errors);
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

	/**
	 * Validates signup form confirm password field.
	 * @param form
	 * @returns signup form confirm password field
	 */
	private _validateSignupFormConfirmPasswordField(form: FormGroup): Observable<any> {
		return form.valueChanges.pipe(
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			tap((_) => {
				if (form.hasError('notSame')) {
					this._confirmPasswordNotMatchReqMet = false;
				} else {
					this._confirmPasswordNotMatchReqMet = true;
				}
			})
		);
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
					this._passwordLowercaseReqMet = false;
				} else {
					this._passwordLowercaseReqMet = true;
				}
				if (passwordControl.hasError('nonAlphanumeric')) {
					this._passwordSpecialCharacterReqMet = false;
				} else {
					this._passwordSpecialCharacterReqMet = true;
				}
				if (passwordControl.hasError('uniqueChars')) {
					this._passwordThreeUniqueCharacterCountReqMet = false;
				} else {
					this._passwordThreeUniqueCharacterCountReqMet = true;
				}
				if ((value || '').length === 0 || passwordControl.hasError('minlength')) {
					this._passwordLengthReqMet = false;
				} else if (passwordControl.hasError('minlength') === false) {
					this._passwordLengthReqMet = true;
				}
			})
		);
	}
}
