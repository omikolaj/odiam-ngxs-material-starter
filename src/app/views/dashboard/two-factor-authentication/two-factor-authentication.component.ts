import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DashboardFacadeService } from '../dashboard-facade.service';
import { Observable } from 'rxjs';
import { AuthenticatorSetupModel } from 'app/core/models/2fa/authenticator-setup.model.2fa';
import { OdmValidators } from 'app/core/form-validators/odm-validators';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AuthenticatorVerificationCodeModel } from 'app/core/models/2fa/authenticator-verification-code-model.2fa';
import { AuthenticatorSetupResultModel } from 'app/core/models/2fa/authenticator-setup-result-model.2fa';
import { LogService } from 'app/core/logger/log.service';
import { tap } from 'rxjs/operators';

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
	_authenticatorSetupModel$: Observable<AuthenticatorSetupModel>;

	/**
	 * Authenticator setup result model. Indicates if authenticator was successfully setup.
	 */
	_authenticatorSetupResultModel$: Observable<AuthenticatorSetupResultModel>;

	_hasAuthenticator$: Observable<boolean>;

	_hasTwoFactorEnabled$: Observable<boolean>;

	_recoveryCodes$: Observable<string[]>;

	/**
	 * Creates an instance of two factor authentication component.
	 * @param facade
	 * @param fb
	 */
	constructor(private facade: DashboardFacadeService, private fb: FormBuilder, private logger: LogService) {
		this._authenticatorSetupModel$ = facade.authenticatorSetupModel$.pipe(tap((v) => console.log(v)));
		this._authenticatorSetupResultModel$ = facade.authenticatorSetupResultModel$.pipe(tap((v) => console.log(v)));
		this._hasAuthenticator$ = facade.hasAuthenticator$.pipe(tap((v) => console.log(v)));
		this._recoveryCodes$ = facade.recoveryCodes$.pipe(tap((v) => console.log(v)));
		this._hasTwoFactorEnabled$ = facade.hasTwoFactorEnabled$.pipe(tap((v) => console.log(v)));
	}

	/**
	 * NgOnInit life cycle.
	 */
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
	 * Event handler for when user initiates 2fa setup.
	 */
	_onSetupAuthenticator(): void {
		this.logger.debug('onSetupAuthenticator event handler fired.', this);
		this.facade.setupAuthenticator();
	}

	/**
	 * Event handler for when user submitts verification code.
	 */
	_onVerifyAuthenticator(event: AuthenticatorVerificationCodeModel): void {
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