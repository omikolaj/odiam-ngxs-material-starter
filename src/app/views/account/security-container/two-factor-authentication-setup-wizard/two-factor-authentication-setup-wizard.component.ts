import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, ValidationErrors, AbstractControl } from '@angular/forms';
import { TwoFactorAuthenticationSetupResult } from 'app/views/account/security-container/two-factor-authentication/models/two-factor-authentication-setup-result.model';
import { LogService } from 'app/core/logger/log.service';
import { TwoFactorAuthenticationVerificationCode } from '../two-factor-authentication/models/two-factor-authentication-verification-code.model';
import { TwoFactorAuthenticationSetup } from 'app/views/account/security-container/two-factor-authentication/models/two-factor-authentication-setup.model';
import { ValidationMessage_Required } from 'app/shared/validation-messages';
import { MatVerticalStepper } from '@angular/material/stepper/stepper';
import { strokeWidth } from 'app/shared/mat-spinner-settings';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { implementsOdmWebApiException } from 'app/core/utilities/implements-odm-web-api-exception';

/**
 * Two factor authentication setup wizard component.
 */
@Component({
	selector: 'odm-two-factor-authentication-setup-wizard',
	templateUrl: './two-factor-authentication-setup-wizard.component.html',
	styleUrls: ['./two-factor-authentication-setup-wizard.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TwoFactorAuthenticationSetupWizardComponent {
	/**
	 * Validation problem details$ of auth container component when form validations get passed angular but fail on the server.
	 */
	@Input() set problemDetails(value: ProblemDetails) {
		this._serverErrorHandled = false;
		this._problemDetails = value;
	}

	private _problemDetails: ProblemDetails;

	private _serverErrorHandled = false;

	/**
	 * Internal server error details$ of auth container component.
	 */
	@Input() internalServerErrorDetails: InternalServerErrorDetails;

	/**
	 * Verification code form.
	 */
	@Input() verificationCodeForm: FormGroup;

	/**
	 * Two factor authentication setup result.
	 */
	@Input() twoFactorAuthenticationSetupResult: TwoFactorAuthenticationSetupResult;

	/**
	 * Two factor authentication setup information.
	 */
	@Input() set twoFactorAuthenticationSetup(value: TwoFactorAuthenticationSetup) {
		this._twoFactorAuthenticationSetup = value;
		if (value.authenticatorUri && value.sharedKey) {
			// enable verification code control
			this.verificationCodeForm.get('verificationCode').enable();
		}
	}

	_twoFactorAuthenticationSetup: TwoFactorAuthenticationSetup;

	/**
	 * Event emitter when user submits verification code.
	 */
	@Output() verificationCodeSubmitted = new EventEmitter<TwoFactorAuthenticationVerificationCode>();

	/**
	 * Event emitter when user cancels out of the setup wizard.
	 */
	@Output() cancelSetupWizardClicked = new EventEmitter<void>();

	/**
	 * Determines whether mat-vertical-stepper is in linear mode or not.
	 */
	_isLinear = true;

	/**
	 * Field is required message.
	 */
	_fieldRequiredMessage = ValidationMessage_Required;

	_qrWidth = 225;

	_strokeWidth = strokeWidth;

	/**
	 * Checks if internal server error implements problem details
	 */
	private get _doesInternalServerErrorImplementOdmWebApiException(): boolean {
		return implementsOdmWebApiException(this.internalServerErrorDetails);
	}

	/**
	 * Creates an instance of two factor authentication setup wizard component.
	 * @param logger
	 */
	constructor(private logger: LogService) {}

	/**
	 * Event handler when user submits two factor authentication setup verification code.
	 */
	_onVerificationCodeSubmitted(): void {
		this.logger.trace('_onVerificationCodeSubmitted fired.', this);
		const code = this.verificationCodeForm.value as TwoFactorAuthenticationVerificationCode;
		this.verificationCodeSubmitted.emit(code);
	}

	/**
	 * Event handler when user clicks Restart or Finish button.
	 * @param stepper
	 */
	_onRestartOrFinishClicked(stepper: MatVerticalStepper): void {
		this.logger.trace('_onRestartOrFinishClicked fired.', this);
		if (this.twoFactorAuthenticationSetupResult.status === 'Succeeded') {
			// finish
		} else {
			this.verificationCodeForm.reset();
			stepper.reset();
		}
	}

	/**
	 * Event handler when user clicks to cancel the setup wizard.
	 */
	_onCancelClicked(): void {
		this.logger.trace('_onCancelClicked fired.', this);
		this.cancelSetupWizardClicked.emit();
	}

	/**
	 * Checks if the verification code control field is invalid.
	 * @returns true if control field is invalid
	 */
	_ifControlFieldIsInvalid(): boolean {
		console.log('runnin');

		const control = this.verificationCodeForm.get('verificationCode');
		console.log(this.verificationCodeForm);
		if (control.invalid) {
			return true;
		} else {
			return this._ifControlFieldIsInvalidatedByServer(control);
		}
	}

	/**
	 * Checks if there were any problem details or internal server errors emitted.
	 * @param control
	 * @returns true if control field is invalidated by server
	 */
	private _ifControlFieldIsInvalidatedByServer(control: AbstractControl): boolean {
		if (this._problemDetails || this.internalServerErrorDetails) {
			if (this._serverErrorHandled === false) {
				return this._setAndHandleServerError(control);
			}
		}
	}

	/**
	 * Sets and handles server error for the given control.
	 * @param control
	 * @returns true to indicate the control is invalid
	 */
	private _setAndHandleServerError(control: AbstractControl): boolean {
		// adds error message to the control
		this._setServerErrorDetails(control);
		this._abstractControlServerErrorHandler(control);
		// return true to indicate the control is invalid with server validatione rrors
		return true;
	}

	/**
	 * Sets server error on the control.
	 * @param control
	 */
	private _setServerErrorDetails(control: AbstractControl): void {
		if (this._problemDetails) {
			const errorDescription = this._problemDetails.detail;
			control.setErrors({ verificationCode: { errorDescription } });
		} else if (this.internalServerErrorDetails) {
			const errorDescription = this._getInternalServerErrorMessage();
			control.setErrors({ internalServerError: { errorDescription } });
		}
	}

	/**
	 * Servers error validation handler. Sets up control for being invalid.
	 * @param control
	 */
	private _abstractControlServerErrorHandler(control: AbstractControl): void {
		control.markAsPristine();
		control.markAsUntouched();
		this._serverErrorHandled = true;

		//this.cd.detectChanges();
		// this.cd.markForCheck();
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
	 * Gets verification code control error message.
	 * @param errors
	 * @returns verification code error message
	 */
	_getVerificationCodeControlErrorMessage(errors: ValidationErrors): string {
		if (errors['required']) {
			return this._fieldRequiredMessage;
		} else if (errors['minlength']) {
			const error = errors['minlength'] as { requiredLength: number };
			return `Verification code is ${error['requiredLength']} characters long.`;
		} else if (errors['maxlength']) {
			const error = errors['maxlength'] as { requiredLength: number };
			return `Verification code must not exceed ${error['requiredLength']} characters.`;
		} else if (errors['verificationCode']) {
			const error = errors['verificationCode'] as { errorDescription: string };
			return error['errorDescription'];
		} else if (errors['internalServerError']) {
			const error = errors['internalServerError'] as { errorDescription: string };
			return error['errorDescription'];
		}
	}
}
