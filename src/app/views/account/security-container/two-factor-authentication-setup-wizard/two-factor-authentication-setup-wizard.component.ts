import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, ValidationErrors } from '@angular/forms';
import { TwoFactorAuthenticationSetupResult } from 'app/views/account/security-container/two-factor-authentication/models/two-factor-authentication-setup-result.model';
import { LogService } from 'app/core/logger/log.service';
import { TwoFactorAuthenticationVerificationCode } from '../two-factor-authentication/models/two-factor-authentication-verification-code.model';
import { TwoFactorAuthenticationSetup } from 'app/views/account/security-container/two-factor-authentication/models/two-factor-authentication-setup.model';
import { ValidationMessage_Required } from 'app/shared/validation-messages';
import { MatVerticalStepper } from '@angular/material/stepper/stepper';

@Component({
	selector: 'odm-two-factor-authentication-setup-wizard',
	templateUrl: './two-factor-authentication-setup-wizard.component.html',
	styleUrls: ['./two-factor-authentication-setup-wizard.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TwoFactorAuthenticationSetupWizardComponent {
	@Input() verificationCodeForm: FormGroup;
	@Input() twoFactorAuthenticationSetupResult: TwoFactorAuthenticationSetupResult;
	@Input() twoFactorAuthenticationSetup: TwoFactorAuthenticationSetup;
	@Output() verificationCodeSubmitted = new EventEmitter<TwoFactorAuthenticationVerificationCode>();
	@Output() cancelSetupWizardClicked = new EventEmitter<void>();
	_isLinear = true;
	_fieldRequiredMessage = ValidationMessage_Required;

	constructor(private logger: LogService) {}

	_onVerificationCodeSubmitted(): void {
		const code = this.verificationCodeForm.value as TwoFactorAuthenticationVerificationCode;
		this.verificationCodeSubmitted.emit(code);
	}

	_onResterOrFinishClicked(stepper: MatVerticalStepper): void {
		if (this.twoFactorAuthenticationSetupResult.status === 'Succeeded') {
			// finish
		} else {
			this.verificationCodeForm.reset();
			stepper.reset();
		}
	}

	_onCancelClicked(): void {
		this.cancelSetupWizardClicked.emit();
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
		}
	}
}
