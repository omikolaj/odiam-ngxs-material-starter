import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { AuthenticatorSetup } from 'app/core/models/2fa/authenticator-setup.model.2fa';
import { AuthenticatorSetupResult } from 'app/core/models/2fa/authenticator-setup-result.model.2fa';
import { TwoFactorAuthenticationStatus } from 'app/core/models/2fa/2fa-status.enum';
import { FormGroup, ValidationErrors } from '@angular/forms';
import { AuthenticatorVerificationCode } from 'app/core/models/2fa/authenticator-verification-code.model.2fa';
import { ValidationMessage_Required } from 'app/shared/validation-messages';

@Component({
	selector: 'odm-two-factor-authentication-setup',
	templateUrl: './two-factor-authentication-setup.component.html',
	styleUrls: ['./two-factor-authentication-setup.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TwoFactorAuthenticationSetupComponent implements OnInit {
	@Input() hasAuthenticator: boolean;

	/**
	 * Authenticator setup model. Responsible for displaying QR code
	 */
	@Input() AuthenticatorSetup: AuthenticatorSetup;

	/**
	 * Authenticator setup result model. Indicates if authenticator was successfully setup.
	 */
	@Input() AuthenticatorSetupResult: AuthenticatorSetupResult = { status: TwoFactorAuthenticationStatus.None, recoveryCodes: [] };

	@Input() verificationCodeForm: FormGroup;

	@Output() setupAuthentictorClicked = new EventEmitter<void>();

	@Output() verificationCodeSubmitted = new EventEmitter<AuthenticatorVerificationCode>();

	private _fieldRequiredMessage = ValidationMessage_Required;

	constructor() {}

	ngOnInit(): void {}

	_onSetupAuthenticator(): void {
		this.setupAuthentictorClicked.emit();
	}

	_onVerificationCodeSubmitted(): void {
		const code = this.verificationCodeForm.value as AuthenticatorVerificationCode;
		this.verificationCodeSubmitted.emit(code);
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
