import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormGroup, ValidationErrors, AbstractControl } from '@angular/forms';
import { TwoFactorAuthenticationSetupResult } from 'app/views/account/security-container/two-factor-authentication/models/two-factor-authentication-setup-result.model';
import { TwoFactorAuthenticationVerificationCode } from '../two-factor-authentication/models/two-factor-authentication-verification-code.model';
import { TwoFactorAuthenticationSetup } from 'app/views/account/security-container/two-factor-authentication/models/two-factor-authentication-setup.model';
import { ODM_SPINNER_DIAMETER, ODM_SPINNER_STROKE_WIDTH } from 'app/shared/global-settings/mat-spinner-settings';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { implementsOdmWebApiException } from 'app/core/utilities/implements-odm-web-api-exception';
import { CdkStepper } from '@angular/cdk/stepper';
import { AccountFacadeService } from '../../account-facade.service';
import { Observable } from 'rxjs';

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
	 * Emitted when server responds with 40X error.
	 */
	@Input() set problemDetails(value: ProblemDetails) {
		this._serverErrorHandled = false;
		this._problemDetails = value;
	}

	private _problemDetails: ProblemDetails;

	/**
	 * Emitted when server responds with 50X error.
	 */
	@Input() set internalServerErrorDetails(value: InternalServerErrorDetails) {
		this._serverErrorHandled = false;
		this._internalServerErrorDetails = value;
	}

	_internalServerErrorDetails: InternalServerErrorDetails;

	/**
	 * Whether there is an outgoing request to verify two factor authentication setup verification code.
	 */
	@Input() codeVerificationInProgress: boolean;

	/**
	 * Verification code form.
	 */
	@Input() verificationCodeForm: FormGroup;

	/**
	 * Two factor authentication setup result.
	 */
	@Input() set twoFactorAuthenticationSetupResult(value: TwoFactorAuthenticationSetupResult) {
		this.facade.log.debug('twoFactorAuthenticationSetupResult emitted.', this);
		if (value.status === 'Succeeded') {
			this._codeVerificationSucceeded = true;
			this._is2faSetupCompleted = true;

			setTimeout(() => {
				this.setupWizard.next();
				this._twoFactorAuthenticationSetupResult = value;
			}, 1500);
		}
	}

	/**
	 * Two factor authentication setup result.
	 */
	_twoFactorAuthenticationSetupResult: TwoFactorAuthenticationSetupResult;

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
	/**
	 * Two factor authentication setup information.
	 */
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
	 * Event emitter when user finishes 2fa setup.
	 */
	@Output() finish2faSetupClicked = new EventEmitter<TwoFactorAuthenticationSetupResult>();

	@Output() serverErrorHandledEmitted = new EventEmitter<boolean>();

	/**
	 * Setup wizard stepper.
	 */
	@ViewChild('stepper') setupWizard: CdkStepper;

	/**
	 * Whether the verification code was successfully verfied.
	 */
	_codeVerificationSucceeded = false;

	/**
	 * Whether server errors were already displayed in the view.
	 */
	_serverErrorHandled = false;

	/**
	 * Whether the validity of previous steps should be checked or not.
	 */
	_stepperIsLinear = true;

	/**
	 * Whether the user can return to this step once it has been marked as completed.
	 */
	_stepper2faSetupEditable = false;

	/**
	 * Verified next step spinner diameter.
	 */
	_verifiedNextStepSpinnerDiameter = 15;

	/**
	 * Verified next step spinner stroke width.
	 */
	_verifiedNextStepSpinnerStrokeWidth = 1;

	/**
	 * QR bar code size.
	 */
	_qrBarCodeWidth = 225;

	/**
	 * QR bar code spinner width.
	 */
	_qrBarCodeSpinnerDiameter = ODM_SPINNER_DIAMETER;

	/**
	 * QR bar code spinner stroke width.
	 */
	_qrBarCodeSpinnerStrokeWidth = ODM_SPINNER_STROKE_WIDTH;

	/**
	 * Whether the two factor authentication setup is complete.
	 */
	_is2faSetupCompleted = false;

	/**
	 * Maximum allowed characters for the verification code input field.
	 */
	_verificationCodeInputLength = 6;

	/**
	 * Checks if internal server error implements OdmWebApiException.
	 */
	private get _doesInternalServerErrorImplementOdmWebApiException(): boolean {
		return implementsOdmWebApiException(this._internalServerErrorDetails);
	}

	/**
	 * Creates an instance of two factor authentication setup wizard component.
	 * @param facade
	 * @param cd
	 */
	constructor(private facade: AccountFacadeService, private cd: ChangeDetectorRef) {}

	/**
	 * Event handler when user submits two factor authentication setup verification code.
	 */
	_onVerificationCodeSubmitted(): void {
		this.facade.log.trace('_onVerificationCodeSubmitted fired.', this);
		const code = this.verificationCodeForm.value as TwoFactorAuthenticationVerificationCode;
		this.verificationCodeSubmitted.emit(code);
	}

	/**
	 * Event handler when user clicks Restart or Finish button.
	 * @param stepper
	 */
	_onFinishSetup(): void {
		this.facade.log.trace('_onRestartOrFinishClicked fired.', this);
		this.finish2faSetupClicked.emit(this._twoFactorAuthenticationSetupResult);
	}

	/**
	 * Event handler when user clicks to cancel the setup wizard.
	 */
	_onCancelClicked(): void {
		this.facade.log.trace('_onCancelClicked fired.', this);
		this.cancelSetupWizardClicked.emit();
	}

	/**
	 * Checks if the verification code control field is invalid.
	 * @returns true if control field is invalid
	 */
	_ifControlFieldIsInvalidOrServerErrorsEmitted(): boolean {
		const control = this.verificationCodeForm.get('verificationCode');
		if (control.invalid) {
			return true;
		} else {
			return this._ifServerErrorOccured(control);
		}
	}

	/**
	 * Checks if there were any problem details or internal server errors emitted.
	 * @param control
	 * @returns true if control field is invalidated by server
	 */
	private _ifServerErrorOccured(control: AbstractControl): boolean {
		if (this._problemDetails || this._internalServerErrorDetails) {
			if (this._serverErrorHandled === false) {
				// only go through if the form is enabled
				if (this.verificationCodeForm.enabled) {
					return this._setAndHandleServerError(control);
				}
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

		// necessary to display error message if verification code is invalid
		this.cd.detectChanges();

		// return true to indicate the control is invalid with server validation errors
		return true;
	}

	/**
	 * Sets server error on the control.
	 * @param control
	 */
	private _setServerErrorDetails(control: AbstractControl): void {
		if (this._problemDetails) {
			// add problem details server error onto verification code control.
			const errorDescription = this._problemDetails.detail;
			control.setErrors({ serverValidationError: true, errorDescription });
		} else if (this._internalServerErrorDetails) {
			// add internal server error onto verification code control.
			const errorDescription = this._getInternalServerErrorMessage();
			control.setErrors({ internalServerError: true, errorDescription });
		}
	}

	/**
	 * Servers error validation handler. Sets control as invalid.
	 * @param control
	 */
	private _abstractControlServerErrorHandler(control: AbstractControl): void {
		control.markAsPristine();
		control.markAsUntouched();
		this._serverErrorHandled = true;
	}

	/**
	 * Gets internal server error message. Used to get errors that are then set
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

	/**
	 * Gets translated error message.
	 * @param errors
	 * @returns translated error message$
	 */
	_getTranslatedErrorMessage$(errors: ValidationErrors): Observable<string> {
		this.serverErrorHandledEmitted.emit(true);
		return this.facade.translateValidationErrorService.translateValidationErrorMessage$(errors);
	}
}
