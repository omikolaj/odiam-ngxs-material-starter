import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TwoFactorAuthenticationSetupResult } from 'app/views/account/security-container/two-factor-authentication/models/two-factor-authentication-setup-result.model';
import { TwoFactorAuthenticationVerificationCode } from '../two-factor-authentication/models/two-factor-authentication-verification-code.model';
import { TwoFactorAuthenticationSetup } from 'app/views/account/security-container/two-factor-authentication/models/two-factor-authentication-setup.model';
import {
	ODM_BIG_SPINNER_DIAMETER,
	ODM_BIG_SPINNER_STROKE_WIDTH,
	ODM_SMALL_SPINNER_STROKE_WIDTH,
	ODM_SMALL_SPINNER_DIAMETER
} from 'app/shared/global-settings/mat-spinner-settings';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { CdkStepper } from '@angular/cdk/stepper';
import { AccountFacadeService } from '../../account-facade.service';
import { AuthBase } from 'app/views/auth/auth-base';

/**
 * Two factor authentication setup wizard component.
 */
@Component({
	selector: 'odm-two-factor-authentication-setup-wizard',
	templateUrl: './two-factor-authentication-setup-wizard.component.html',
	styleUrls: ['./two-factor-authentication-setup-wizard.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TwoFactorAuthenticationSetupWizardComponent extends AuthBase {
	/**
	 * Emitted when server responds with 40X error.
	 */
	@Input() set problemDetails(value: ProblemDetails) {
		this.facade.log.debug('Problem Ddetails emitted.', this);
		this.problemDetailsError = value;
	}

	/**
	 * Emitted when server responds with 50X error.
	 */
	@Input() set internalServerErrorDetails(value: InternalServerErrorDetails) {
		this.facade.log.debug('Internal server error emitted.', this);
		this.internalServerError = value;
	}

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
		this.log.debug('twoFactorAuthenticationSetup emitted.', this);
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

	/**
	 * Event emitter whether server side error has been displayed by this component.
	 */
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
	 * Verified next step button spinner diameter.
	 */
	readonly _verifiedNextStepSpinnerDiameter = ODM_SMALL_SPINNER_DIAMETER;

	/**
	 * Verified next step button spinner stroke width.
	 */
	readonly _verifiedNextStepSpinnerStrokeWidth = ODM_SMALL_SPINNER_STROKE_WIDTH;

	/**
	 * QR bar code size.
	 */
	readonly _qrBarCodeWidth = 225;

	/**
	 * QR bar code spinner width.
	 */
	readonly _qrBarCodeSpinnerDiameter = ODM_BIG_SPINNER_DIAMETER;

	/**
	 * QR bar code spinner stroke width.
	 */
	readonly _qrBarCodeSpinnerStrokeWidth = ODM_BIG_SPINNER_STROKE_WIDTH;

	/**
	 * Whether the two factor authentication setup is complete.
	 */
	_is2faSetupCompleted = false;

	/**
	 * Maximum allowed characters for the verification code input field.
	 */
	readonly _verificationCodeInputLength = 6;

	/**
	 * Creates an instance of two factor authentication setup wizard component.
	 * @param facade
	 * @param cd
	 */
	constructor(private facade: AccountFacadeService, cd: ChangeDetectorRef) {
		super(facade.translateValidationErrorService, facade.log, cd);
	}

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
}
