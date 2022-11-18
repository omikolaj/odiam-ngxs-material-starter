import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ODM_BIG_SPINNER_DIAMETER, ODM_BIG_SPINNER_STROKE_WIDTH } from 'app/shared/global-settings/mat-spinner-settings';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { CdkStepper } from '@angular/cdk/stepper';
import { TwoFactorAuthenticationSetupResult } from 'app/core/models/account/security/two-factor-authentication-setup-result.model';
import { TwoFactorAuthenticationSetup } from 'app/core/models/account/security/two-factor-authentication-setup.model';
import { TwoFactorAuthenticationVerificationCode } from 'app/core/models/account/security/two-factor-authentication-verification-code.model';
import { LogService } from 'app/core/logger/log.service';

/**
 * Two factor authentication setup wizard component.
 */
@Component({
	selector: 'odm-two-factor-authentication-setup-wizard',
	templateUrl: './two-factor-authentication-setup-wizard.component.html',
	styleUrls: ['./two-factor-authentication-setup-wizard.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TwoFactorAuthenticationSetupWizardComponent implements OnDestroy {
	/**
	 * Emitted when server responds with 40X error.
	 */
	@Input() problemDetails: ProblemDetails;

	/**
	 * Emitted when server responds with 50X error.
	 */
	@Input() internalServerErrorDetails: InternalServerErrorDetails;

	/**
	 * Whether there is an outgoing request to verify two factor authentication setup verification code.
	 */
	@Input() codeVerificationInProgress: boolean;

	/**
	 * Verification code form.
	 */
	@Input() verificationCodeForm: UntypedFormGroup;

	/**
	 * Two factor authentication setup result.
	 */
	@Input() set twoFactorAuthenticationSetupResult(value: TwoFactorAuthenticationSetupResult) {
		this._log.debug('twoFactorAuthenticationSetupResult emitted.', this);
		if (value.status === 'Succeeded') {
			this._codeVerificationSucceeded = true;
			this._is2faSetupCompleted = true;

			setTimeout(() => {
				this.setupWizard.next();
				this._twoFactorAuthenticationSetupResult = value;
			}, 1000);
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
		this._log.debug('twoFactorAuthenticationSetup emitted.', this);
		this._twoFactorAuthenticationSetup = value;
		if (value.authenticatorUri && value.sharedKey) {
			// enable verification code control
			this.verificationCodeForm.get('code').enable();
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
	 * Setup wizard stepper.
	 */
	@ViewChild('stepper') setupWizard: CdkStepper;

	/**
	 * Whether the verification code was successfully verfied.
	 */
	_codeVerificationSucceeded = false;

	/**
	 * Whether the validity of previous steps should be checked or not.
	 */
	_stepperIsLinear = true;

	/**
	 * Whether the user can return to this step once it has been marked as completed.
	 */
	_stepper2faSetupEditable = false;

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
	 * Creates an instance of two factor authentication setup wizard component.
	 * @param _log
	 */
	constructor(private _log: LogService) {}

	/**
	 * NgOnDestroy life cycle.
	 */
	ngOnDestroy(): void {
		this._log.trace('Destroyed.', this);
		this.cancelSetupWizardClicked.emit();
		this._log.trace('cancelSetupWizardClicked emitted from ngOnDestroy. Notifing parent that setup wizard no longer needs to be displayed.', this);
	}

	/**
	 * Event handler when user submits two factor authentication setup verification code.
	 */
	_onVerificationCodeSubmitted(event: unknown): void {
		this._log.trace('_onVerificationCodeSubmitted fired.', this);
		this.verificationCodeSubmitted.emit(event as TwoFactorAuthenticationVerificationCode);
	}

	/**
	 * Event handler when user clicks Restart or Finish button.
	 * @param stepper
	 */
	_onFinishSetup(): void {
		this._log.trace('_onRestartOrFinishClicked fired.', this);
		this.finish2faSetupClicked.emit(this._twoFactorAuthenticationSetupResult);
	}

	/**
	 * Event handler when user clicks to cancel the setup wizard.
	 */
	_onCancelClicked(): void {
		this._log.trace('_onCancelClicked fired.', this);
		this.cancelSetupWizardClicked.emit();
	}
}
