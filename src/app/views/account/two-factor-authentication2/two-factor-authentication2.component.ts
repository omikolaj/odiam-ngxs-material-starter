import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { AccountFacadeService } from '../account-facade.service';
import { Observable } from 'rxjs';
import { AuthenticatorSetup } from 'app/core/models/2fa/authenticator-setup.model.2fa';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AuthenticatorSetupResult } from 'app/core/models/2fa/authenticator-setup-result.model.2fa';
import { LogService } from 'app/core/logger/log.service';
import { OdmValidators } from 'app/core/form-validators/odm-validators';
import { AuthenticatorVerificationCode } from 'app/core/models/2fa/authenticator-verification-code.model.2fa';

/**
 * Component responsible for handling two factor authentication settings.
 */
@Component({
	selector: 'odm-two-factor-authentication2',
	templateUrl: './two-factor-authentication2.component.html',
	styleUrls: ['./two-factor-authentication2.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TwoFactorAuthentication2Component implements OnInit {
	_showTwoFactorAuthSetupWizard = false;

	/**
	 * Initial state of the user's two factor authentication setting.
	 */
	@Input() twoFactorEnabled: boolean;

	/**
	 * Creates an instance of two factor authentication2 component.
	 * @param facade
	 */

	_authenticatorSetup$: Observable<AuthenticatorSetup>;
	_verificationCodeForm: FormGroup;

	/**
	 * Authenticator setup result model. Indicates if authenticator was successfully setup.
	 */
	_authenticatorSetupResult$: Observable<AuthenticatorSetupResult>;

	constructor(private facade: AccountFacadeService, private fb: FormBuilder, private logger: LogService) {
		this._authenticatorSetup$ = facade.authenticatorSetup$;
		this._authenticatorSetupResult$ = facade.authenticatorSetupResult$;
	}

	ngOnInit(): void {
		this._initVerificationCodeForm();
	}

	/**
	 * Initializes verification code form.
	 */
	private _initVerificationCodeForm(): void {
		this._verificationCodeForm = this.fb.group({
			verificationCode: this.fb.control('', [OdmValidators.required, OdmValidators.minLength(6)])
		});
	}

	/**
	 * Event handler when user requests to enable/disable two factor authentication.
	 * @param event
	 */
	_onTwoFactorAuthToggle(event: MatSlideToggleChange): void {
		if (event.checked) {
			this.facade.setupAuthenticator();
			this._showTwoFactorAuthSetupWizard = event.checked;
		} else {
			this.facade.disable2Fa();
		}
	}

	/**
	 * Event handler for when user requests to generate new recovery codes.
	 */
	_onGenerateNew2FaRecoveryCodes(): void {
		this.facade.generateRecoveryCodes();
	}

	_onVerifyAuthenticator(event: AuthenticatorVerificationCode): void {}
}
