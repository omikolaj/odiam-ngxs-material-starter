import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AccountFacadeService } from '../account-facade.service';
import { Observable } from 'rxjs';
import { AuthenticatorSetup } from 'app/core/models/2fa/authenticator-setup.model.2fa';
import { OdmValidators } from 'app/core/form-validators/odm-validators';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AuthenticatorVerificationCode } from 'app/core/models/2fa/authenticator-verification-code.model.2fa';
import { AuthenticatorSetupResult } from 'app/core/models/2fa/authenticator-setup-result.model.2fa';
import { LogService } from 'app/core/logger/log.service';
import { tap } from 'rxjs/operators';
import { TwoFactorConfigurationStatus } from 'app/core/models/2fa/2fa-configuration-status.model';

/**
 * Component responsible for handling two factor authentication.
 */
@Component({
	selector: 'odm-two-factor-authentication',
	templateUrl: './two-factor-authentication.component.html',
	styleUrls: ['./two-factor-authentication.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TwoFactorAuthenticationComponent implements OnInit {
	/**
	 * Verification code form.
	 */
	_verificationCodeForm: FormGroup;

	/**
	 * Authenticator setup model. Responsible for displaying QR code
	 */
	_authenticatorSetupModel$: Observable<AuthenticatorSetup>;

	/**
	 * Authenticator setup result model. Indicates if authenticator was successfully setup.
	 */
	_authenticatorSetupResultModel$: Observable<AuthenticatorSetupResult>;

	_hasAuthenticator$: Observable<boolean>;

	_hasTwoFactorEnabled$: Observable<boolean>;

	_recoveryCodes$: Observable<string[]>;

	_twoFactorConfigurationStatus$: Observable<TwoFactorConfigurationStatus>;

	/**
	 * Creates an instance of two factor authentication component.
	 * @param facade
	 * @param fb
	 */
	constructor(private facade: AccountFacadeService, private fb: FormBuilder, private logger: LogService) {
		this._authenticatorSetupModel$ = facade.AuthenticatorSetup$.pipe(tap((v) => console.log(v)));
		this._authenticatorSetupResultModel$ = facade.AuthenticatorSetupResult$.pipe(tap((v) => console.log(v)));
		this._hasAuthenticator$ = facade.hasAuthenticator$.pipe(tap((v) => console.log(v)));
		this._recoveryCodes$ = facade.recoveryCodes$.pipe(tap((v) => console.log(v)));
		this._hasTwoFactorEnabled$ = facade.hasTwoFactorEnabled$.pipe(tap((v) => console.log(v)));
		this._twoFactorConfigurationStatus$ = facade.twoFactorConfigurationStatus$.pipe(tap((v) => console.log(v)));
	}

	/**
	 * NgOnInit life cycle.
	 */
	ngOnInit(): void {
		this.facade.twoFactorConfigurationStatus$.pipe(tap((v) => console.log(v))).subscribe();
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
	 * Event handler for when user initiates 2fa setup.
	 */
	_onSetupAuthenticator(): void {
		this.logger.debug('onSetupAuthenticator event handler fired.', this);
		this.facade.setupAuthenticator();
	}

	/**
	 * Event handler for when user submitts verification code.
	 */
	_onVerifyAuthenticator(event: AuthenticatorVerificationCode): void {
		this.logger.debug('onVerifyAuthenticator event handler fired.', this);
		this.facade.verifyAuthenticator(event);
	}

	/**
	 * Event handler for when user requests to re-generate recovery codes.
	 */
	_onResetRecoveryCodes(): void {
		this.logger.debug('onResetRecoveryCodes event handler fired.', this);
		this.facade.generateRecoveryCodes();
	}

	/**
	 * Event handler for when user requests to disable 2fa authentication.
	 */
	_onDisable2Fa(): void {
		this.logger.debug('onDisable2Fa event handler fired.', this);
		this.facade.disable2Fa();
	}
}
