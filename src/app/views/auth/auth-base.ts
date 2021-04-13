import { ChangeDetectorRef } from '@angular/core';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { implementsOdmWebApiException } from 'app/core/utilities/implements-odm-web-api-exception';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthControlType } from '../../shared/auth-abstract-control-type';
import { Observable, of } from 'rxjs';
import { LogService } from 'app/core/logger/log.service';
import { TranslateValidationErrorsService } from '../../shared/services/translate-validation-errors.service';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';

/**
 * Auth base class which contains error handling logic.
 */
export class AuthBase {
	/**
	 * Hide/show password.
	 */
	_hide = true;

	/**
	 * Facebook login icon.
	 */
	_facebookLoginIcon = (require('../../../assets/facebook_icon_color.svg') as { default: string }).default;

	/**
	 * Google login icon.
	 */
	_googleLoginIcon = (require('../../../assets/google_icon_color.svg') as { default: string }).default;

	/**
	 * Sets internal server error.
	 */
	protected set internalServerError(value: InternalServerErrorDetails) {
		this._internalServerErrorDetailsHandled = false;
		this._problemDetails = null;
		this._internalServerErrorDetails = value;
	}

	/**
	 * When server responds with 50X error.
	 */
	private _internalServerErrorDetails: InternalServerErrorDetails;

	/**
	 * Whether internal server error details has been handled by the component and displayed to the user.
	 */
	private _internalServerErrorDetailsHandled: boolean;

	/**
	 * Sets problem details error.
	 */
	protected set problemDetailsError(value: ProblemDetails) {
		this._problemDetailsServerErrorHandled = false;
		this._internalServerErrorDetails = null;
		this._problemDetails = value;
	}

	/**
	 * When server responds with 40X error.
	 */
	private _problemDetails: ProblemDetails;

	/**
	 * If server error occured, this property is used to determine if the error has been handled by the component in the template.
	 */
	private _problemDetailsServerErrorHandled: boolean;

	/**
	 * Checks if internal server error implements problem details
	 */
	private get _doesInternalServerErrorImplementOdmWebApiException(): boolean {
		return implementsOdmWebApiException(this._internalServerErrorDetails);
	}

	/**
	 * Whether internal server error occured.
	 */
	get _internalServerErrorOccured(): boolean {
		return !!this._internalServerErrorDetails;
	}

	/**
	 * Whether server error occured.
	 */
	private get _serverErrorOccured(): boolean {
		return !!this._problemDetails && !this._problemDetails.errors;
	}

	/**
	 * Whether server validation error occured.
	 */
	private get _serverValidationErrorOccured(): boolean {
		return !!this._problemDetails?.errors;
	}

	/**
	 * Gets problem details validation errors keys. For example passwordIsTooShort, passwordRequiresDigit etc.
	 * These validation errors come from the server.
	 */
	private get _problemDetailsValidationErrorsKeys(): string[] {
		return Object.keys(this._problemDetails.errors).map((err) => err.toLocaleLowerCase());
	}

	/**
	 * Creates an instance of auth base.
	 * @param _translateErrorValidationService
	 * @param log
	 * @param _cd
	 */
	constructor(
		private _translateErrorValidationService: TranslateValidationErrorsService,
		protected log: LogService,
		private _cd: ChangeDetectorRef
	) {}

	/**
	 * Checks if the control field is invalid by also checking server side validations.
	 * @param control
	 * @param controlType
	 * @returns true if control field is invalid
	 */
	_ifControlFieldIsInvalid(control: AbstractControl, controlType?: AuthControlType): boolean {
		if (control.invalid) {
			return true;
		} else {
			return this._ifServerErrorOccured(control, controlType);
		}
	}

	/**
	 * Gets error message. Translates validation error messages.
	 * @param control
	 * @returns error message
	 */
	_getErrorMessage$(control: AbstractControl): Observable<string> {
		if (control.hasError('serverError')) {
			const error = control.getError('serverError') as { errorDescription: string };
			return of(error.errorDescription);
		} else if (control.errors) {
			return this._getTranslatedValidationErrorMessage$(control.errors);
		}
	}

	/**
	 * Determines if any server errors occured.
	 * @param control
	 * @param controlType
	 * @returns true if server error occured
	 */
	_ifServerErrorOccured(control: AbstractControl, controlType?: AuthControlType): boolean {
		// if internal server error occured set control as invalid.
		if (this._internalServerErrorOccured) {
			return this._handleInternalServerError(control);
		}
		// else if server validation error occured set control as invalid.
		else if (this._serverValidationErrorOccured) {
			return this._handleServerValidationError(control, controlType);
		}
		// else if server error occured set control as invalid.
		else if (this._serverErrorOccured) {
			return this._handleServerError(control);
		}

		return false;
	}

	/**
	 * Handles internal server error.
	 * @param control
	 * @returns true if internal server error
	 */
	private _handleInternalServerError(control: AbstractControl): boolean {
		if (this._internalServerErrorDetailsHandled === false) {
			this._setInternalServerError(control);
			return true;
		}
		// if control is prestine keep the server error message displayed, else remove it.
		return control.pristine;
	}

	/**
	 * Sets internal server error on the passed in control.
	 * @param control
	 */
	private _setInternalServerError(control: AbstractControl): void {
		const errorDescription = this._getInternalServerErrorMessage();
		control.setErrors({ serverError: { errorDescription } });
		control.markAsPristine();
		this._internalServerErrorDetailsHandled = true;
		this._cd.detectChanges();
	}

	/**
	 * Handles server validation error.
	 * @param control
	 * @param controlType
	 * @returns true if server validation error
	 */
	private _handleServerValidationError(control: AbstractControl, controlType: AuthControlType): boolean {
		if (this._problemDetailsServerErrorHandled === false) {
			const errors = this._problemDetailsValidationErrorsKeys;
			if (this._validationErrorMatchesControlType(errors, controlType)) {
				this._setServerValidationError(control);
				return true;
			} else if (!controlType) {
				this.log.warn('ControlType not specified!', this);
				// fallback, in case controlType is null and not specified.
				this._setServerValidationError(control);
			}
		}

		// if control is prestine keep the server error message displayed, else remove it.
		return control.pristine;
	}

	/**
	 * Sets server validation error on the passed in control.
	 * @param control
	 */
	private _setServerValidationError(control: AbstractControl): void {
		const errorDescriptions = Object.values(this._problemDetails.errors);
		if (errorDescriptions.length > 0) {
			const firstErrorDescription = errorDescriptions[0];
			if (firstErrorDescription.length > 0) {
				const errorDescription = `Server validation error: ${firstErrorDescription[0]}`;
				control.setErrors({ serverError: { errorDescription } });
				control.markAsPristine();
				this._problemDetailsServerErrorHandled = true;
				this._cd.detectChanges();
			}
		}
	}

	/**
	 * Handles server error.
	 * @param control
	 * @returns true if server error
	 */
	private _handleServerError(control: AbstractControl): boolean {
		if (this._problemDetailsServerErrorHandled === false) {
			this._setServerError(control);
			return true;
		}
		// if control is prestine keep the server error message displayed, else remove it.
		return control.pristine;
	}

	/**
	 * Sets server error on the passed in control.
	 * @param control
	 */
	private _setServerError(control: AbstractControl): void {
		const errorDescription = this._problemDetails.detail;
		control.setErrors({ serverError: { errorDescription } });
		control.markAsPristine();
		this._problemDetailsServerErrorHandled = true;
		this._cd.detectChanges();
	}

	/**
	 * Gets translated validation error message. Only applies to client side error messages.
	 * @param errors
	 * @returns translated error message
	 */
	private _getTranslatedValidationErrorMessage$(errors: ValidationErrors): Observable<string> {
		return this._translateErrorValidationService.translateValidationErrorMessage$(errors);
	}

	/**
	 * Whether server side errors contain the name of the passed in control type.
	 * Either 'email' or 'password'.
	 * @param errors
	 * @param controlType
	 * @returns true if error matches control type
	 */
	private _validationErrorMatchesControlType(errors: string[], controlType: AuthControlType): boolean {
		return errors.map((err) => err.includes(controlType)).includes(true);
	}

	/**
	 * Gets internal server error message.
	 * @returns internal server error message
	 */
	private _getInternalServerErrorMessage(): string {
		let errorDescription = '';
		if (this._doesInternalServerErrorImplementOdmWebApiException) {
			errorDescription = this._internalServerErrorDetails.detail;
		} else {
			errorDescription = this._internalServerErrorDetails.message;
		}
		return errorDescription;
	}
}
