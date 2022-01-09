import { ChangeDetectorRef } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { LogService } from '../../core/logger/log.service';
import { InternalServerErrorDetails } from '../../core/models/internal-server-error-details.model';
import { ProblemDetails } from '../../core/models/problem-details.model';
import { implementsOdmWebApiException } from '../../core/utilities/implements-odm-web-api-exception';
import { TranslateValidationErrorsService } from '../../shared/services/translate-validation-errors.service';

/**
 * Auth base class which contains error handling logic.
 */
export class AuthBase {
	/**
	 * Sets internal server error.
	 */
	protected set internalServerError(value: InternalServerErrorDetails) {
		this.log.debug('[AuthBase]: Setting internalServerError.', this);
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
		this.log.debug('[AuthBase]: Setting problemDetailsError.', this);
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
	 * Creates an instance of auth base.
	 * @param _translateErrorValidationService
	 * @param log
	 * @param cd
	 */
	constructor(
		private _translateErrorValidationService: TranslateValidationErrorsService,
		protected log: LogService,
		protected cd: ChangeDetectorRef
	) {}

	/**
	 * Checks if the control field is invalid by also checking server side validations.
	 * @param control
	 * @returns true if control field is invalid
	 */
	_ifControlFieldIsInvalid(control: AbstractControl): boolean {
		if (control?.invalid) {
			return true;
		} else {
			return this._ifServerErrorOccured(control);
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
	 * @returns true if server error occured
	 */
	_ifServerErrorOccured(control: AbstractControl): boolean {
		// if internal server error occured set control as invalid.
		if (this._internalServerErrorOccured) {
			this.log.trace('[_ifServerErrorOccured]: InternalServerErrorOccured.', this);
			return this._handleInternalServerError(control);
		}
		// else if server validation error occured set control as invalid.d
		else if (this._serverValidationErrorOccured) {
			this.log.trace('[_ifServerErrorOccured]: ServerValidationErrorOccured.', this);
			return this._handleServerValidationError(control);
		}
		// else if server error occured set control as invalid.
		else if (this._serverErrorOccured) {
			this.log.trace('[_ifServerErrorOccured]: ServerErrorOccured.', this);
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
		this.log.trace('[_handleInternalServerError]: Was server error handled:', this, this._internalServerErrorDetailsHandled);
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
		this._internalServerErrorDetailsHandled = true;
		this.cd.detectChanges();
	}

	/**
	 * Handles server validation error.
	 * @param control
	 * @returns true if server validation error
	 */
	private _handleServerValidationError(control: AbstractControl): boolean {
		this.log.trace('[_handleServerValidationError]: Was server error handled:', this, this._problemDetailsServerErrorHandled);
		if (this._problemDetailsServerErrorHandled === false) {
			this._setServerValidationError(control);
			return true;
		}

		// if control is prestine keep the server error message displayed.
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
				this._problemDetailsServerErrorHandled = true;
				this.cd.detectChanges();
			}
		}
	}

	/**
	 * Handles server error.
	 * @param control
	 * @returns true if server error
	 */
	private _handleServerError(control: AbstractControl): boolean {
		this.log.debug('[_handleServerError]: Was problemDetailsServerErrorHandled:', this, this._problemDetailsServerErrorHandled);
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
		this.log.debug('[_setServerError]: fired.', this);
		const errorDescription = this._problemDetails.detail;
		control.setErrors({ serverError: { errorDescription } });
		this._problemDetailsServerErrorHandled = true;
		this.log.debug('[_setServerError]: running change detection.', this);
		this.cd.detectChanges();
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
