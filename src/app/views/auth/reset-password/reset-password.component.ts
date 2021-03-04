import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthFacadeService } from '../auth-facade.service';
import { PasswordReset } from 'app/core/auth/models/password-reset.model';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { implementsOdmWebApiException } from 'app/core/utilities/implements-odm-web-api-exception';
import { ROUTE_ANIMATIONS_ELEMENTS } from 'app/core/core.module';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { Observable, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthControlType } from 'app/shared/auth-abstract-control-type';
import { OdmValidators } from 'app/core/form-validators/odm-validators';

/**
 * Reset password component.
 */
@Component({
	selector: 'odm-reset-password',
	templateUrl: './reset-password.component.html',
	styleUrls: ['./reset-password.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
	/**
	 * Reset password form of reset password component.
	 */
	_resetPasswordForm: FormGroup;

	/**
	 * Emitted when server responds with 40X error.
	 */
	set problemDetails(value: Observable<ProblemDetails>) {
		this.facade.log.debug('Problem details emitted.', this);
		this._problemDetailsServerErrorHandled = false;
		this._subscription.add(
			value
				.pipe(
					tap((value: ProblemDetails) => {
						this._problemDetails = value;
					})
				)
				.subscribe()
		);
	}

	/**
	 * InternalServerErrorDetails for when server crashes and responds with 50X error.
	 */
	set internalServerErrorDetails(value: Observable<InternalServerErrorDetails>) {
		this.facade.log.debug('Problem details emitted.', this);
		this._subscription.add(
			value
				.pipe(
					tap((value: InternalServerErrorDetails) => {
						this._internalServerErrorDetails = value;
					})
				)
				.subscribe()
		);
	}

	/**
	 * Emitted when server responds with 50X error.
	 */
	private _internalServerErrorDetails: InternalServerErrorDetails;

	/**
	 * Gets whether is internal server error occured.
	 */
	get _isInternalServerError(): boolean {
		return !!this.internalServerErrorDetails;
	}

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
	 *  Reset password form email control status changes$.
	 */
	_resetPasswordFormEmailControlStatusChanges$: Observable<string>;

	/**
	 * Determines whether the problem details error is validation related to model validations.
	 */
	private get _isServerValidationError(): boolean {
		return !!this._problemDetails.errors;
	}
	/**
	 * Checks if internal server error implements problem details
	 */
	private get _doesInternalServerErrorImplementOdmWebApiException(): boolean {
		return implementsOdmWebApiException(this._internalServerErrorDetails);
	}
	/**
	 * If server error occured, this property is used to determine if the error has been handled by the component in the template.
	 */
	private _problemDetailsServerErrorHandled: boolean;

	/**
	 * Validation problem details used to check server side validation errors.
	 */
	private _problemDetails: ProblemDetails;

	/**
	 * Subscriptions for this component.
	 */
	private _subscription = new Subscription();

	/**
	 * Creates an instance of reset password component.
	 * @param fb
	 * @param facade
	 */
	constructor(private fb: FormBuilder, private facade: AuthFacadeService, private cd: ChangeDetectorRef) {
		this.problemDetails = this.facade.problemDetails$;
		this.internalServerErrorDetails = this.facade.internalServerErrorDetails$;
	}

	/**
	 * NgOnInit life cycle.
	 */
	ngOnInit(): void {
		this.facade.log.trace('Initialized.', this);
		this._initForm();
		this._resetPasswordFormEmailControlStatusChanges$ = this._resetPasswordForm.get('email').statusChanges.pipe(
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			tap((_: string) => {
				if (this._isInternalServerError) {
					// null out internalServerErrorDetails when the email
					// control statusChanges. Necessary to remove old message
					// and display new one.
					this._internalServerErrorDetails = null;
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
	 * Event handler for when user submits password reset form.
	 */
	_onSubmit(): void {
		const model = this._resetPasswordForm.value as PasswordReset;
		this.facade.onResetPassword(model);
	}

	/**
	 * Gets internal server error message.
	 * @returns internal server error message
	 */
	_getInternalServerErrorMessage(): string {
		let errorDescription = '';
		if (this._doesInternalServerErrorImplementOdmWebApiException) {
			errorDescription = this._internalServerErrorDetails.detail;
		} else {
			errorDescription = this._internalServerErrorDetails.message;
		}
		return errorDescription;
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
	 * Inits form for reset-password component.
	 */
	private _initForm(): void {
		this._resetPasswordForm = this._initResetPasswordForm();
	}

	/**
	 * Inits reset password form.
	 * @returns reset password form
	 */
	private _initResetPasswordForm(): FormGroup {
		return this.fb.group(
			{
				email: this.fb.control('', [OdmValidators.required, OdmValidators.email]),
				password: this.fb.control('', {
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
				confirmPassword: this.fb.control('')
			},
			{
				validators: OdmValidators.requireConfirmPassword,
				updateOn: 'change'
			}
		);
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
}
