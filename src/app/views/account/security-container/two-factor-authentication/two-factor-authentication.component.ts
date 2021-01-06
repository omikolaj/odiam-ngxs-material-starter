import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { AccountFacadeService } from '../../account-facade.service';
import { Observable } from 'rxjs';
import { TwoFactorAuthenticationSetup } from 'app/views/account/security-container/two-factor-authentication/models/two-factor-authentication-setup.model';
import { FormGroup, FormBuilder } from '@angular/forms';
import { TwoFactorAuthenticationSetupResult } from 'app/views/account/security-container/two-factor-authentication/models/two-factor-authentication-setup-result.model';
import { LogService } from 'app/core/logger/log.service';
import { OdmValidators } from 'app/core/form-validators/odm-validators';
import { TwoFactorAuthenticationVerificationCode } from 'app/views/account/security-container/two-factor-authentication/models/two-factor-authentication-verification-code.model';

/**
 * Component responsible for handling two factor authentication settings.
 */
@Component({
	selector: 'odm-two-factor-authentication',
	templateUrl: './two-factor-authentication.component.html',
	styleUrls: ['./two-factor-authentication.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TwoFactorAuthenticationComponent implements OnInit {
	_showTwoFactorAuthSetupWizard = false;

	/**
	 * Initial state of the user's two factor authentication setting.
	 */
	@Input() twoFactorEnabled: boolean;

	@Input() userRecoveryCodes: string[] = [];

	/**
	 * Creates an instance of two factor authentication2 component.
	 * @param facade
	 */

	_authenticatorSetup$: Observable<TwoFactorAuthenticationSetup>;
	_verificationCodeForm: FormGroup;

	/**
	 * Authenticator setup result model. Indicates if authenticator was successfully setup.
	 */
	_authenticatorSetupResult$: Observable<TwoFactorAuthenticationSetupResult>;

	constructor(private facade: AccountFacadeService, private fb: FormBuilder, private logger: LogService) {
		this._authenticatorSetup$ = facade.twoFactorAuthenticationSetup$;
		this._authenticatorSetupResult$ = facade.twoFactorAuthenticationSetupResult$;
	}

	ngOnInit(): void {
		this._initVerificationCodeForm();
	}

	/**
	 * Initializes verification code form.
	 */
	private _initVerificationCodeForm(): void {
		this._verificationCodeForm = this.fb.group({
			verificationCode: this.fb.control('', {
				validators: [OdmValidators.required, OdmValidators.minLength(6)],
				updateOn: 'blur'
			})
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

	_onCancelSetupWizard(): void {
		this._showTwoFactorAuthSetupWizard = false;
	}

	/**
	 * Event handler for when user requests to generate new recovery codes.
	 */
	_onGenerateNew2FaRecoveryCodes(): void {
		this.facade.generateRecoveryCodes();
	}

	_onVerifyAuthenticator(event: TwoFactorAuthenticationVerificationCode): void {
		this.facade.verifyAuthenticator(event);
	}
}
