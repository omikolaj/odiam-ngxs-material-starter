import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AuthenticatorSetupResult } from 'app/core/models/2fa/authenticator-setup-result.model.2fa';
import { AuthenticatorSetup } from '../two-factor-authentication/two-factor-authentication.store.actions';
import { LogService } from 'app/core/logger/log.service';
import { AuthenticatorVerificationCode } from '../../../core/models/2fa/authenticator-verification-code.model.2fa';

@Component({
	selector: 'odm-two-factor-authentication-setup-wizard',
	templateUrl: './two-factor-authentication-setup-wizard.component.html',
	styleUrls: ['./two-factor-authentication-setup-wizard.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TwoFactorAuthenticationSetupWizardComponent {
	@Input() verificationCodeForm: FormGroup;
	@Input() authenticatorSetupResult: AuthenticatorSetupResult;
	@Input() authenticatorSetup: AuthenticatorSetup;
	@Output() verificationCodeSubmitted = new EventEmitter<AuthenticatorVerificationCode>();

	constructor(private logger: LogService) {}

	_onSubmit(): void {}
}
