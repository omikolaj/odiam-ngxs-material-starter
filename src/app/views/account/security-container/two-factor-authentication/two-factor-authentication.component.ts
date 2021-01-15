import { Component, ChangeDetectionStrategy, Input, OnInit, OnDestroy } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { AccountFacadeService } from '../../account-facade.service';
import { Observable, merge, Subscription, of, Subject } from 'rxjs';
import { TwoFactorAuthenticationSetup } from 'app/views/account/security-container/two-factor-authentication/models/two-factor-authentication-setup.model';
import { FormGroup, FormBuilder } from '@angular/forms';
import { TwoFactorAuthenticationSetupResult } from 'app/views/account/security-container/two-factor-authentication/models/two-factor-authentication-setup-result.model';
import { LogService } from 'app/core/logger/log.service';
import { OdmValidators } from 'app/core/form-validators/odm-validators';
import { TwoFactorAuthenticationVerificationCode } from 'app/views/account/security-container/two-factor-authentication/models/two-factor-authentication-verification-code.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { filter } from 'rxjs/internal/operators/filter';
import { tap } from 'rxjs/internal/operators/tap';

/**
 * Component responsible for handling two factor authentication settings.
 */
@Component({
	selector: 'odm-two-factor-authentication',
	templateUrl: './two-factor-authentication.component.html',
	styleUrls: ['./two-factor-authentication.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TwoFactorAuthenticationComponent implements OnInit, OnDestroy {
	/**
	 * Show two factor auth setup wizard.
	 */
	_showTwoFactorAuthSetupWizard = false;

	/**
	 * Validation problem details$ of auth container component when form validations get passed angular but fail on the server.
	 */
	_problemDetails$: Observable<ProblemDetails>;

	/**
	 * Internal server error details$ of auth container component.
	 */
	_internalServerErrorDetails$: Observable<InternalServerErrorDetails>;

	/**
	 * Initial state of the user's two factor authentication setting.
	 */
	@Input() twoFactorEnabled: boolean;

	/**
	 * Recovery codes user has left to redeem for logging in.
	 */
	@Input() userRecoveryCodes: string[] = [];

	/**
	 * Whether there is an outgoing request to generate new recovery codes.
	 */
	_generatingNewRecoveryCodes: boolean;

	/**
	 * Two factor authenticator setup.
	 */
	_authenticatorSetup$: Observable<TwoFactorAuthenticationSetup>;

	/**
	 * Verification code form for two factor authentication setup.
	 */
	_verificationCodeForm: FormGroup;

	/**
	 * Authenticator setup result model.
	 */
	_authenticatorSetupResult$: Observable<TwoFactorAuthenticationSetupResult>;

	/**
	 * Whether we are in the middle of a request to verify 2fa setup verification code.
	 */
	_codeVerificationInProgress: boolean;

	/**
	 * Subscription for all manual subscriptions for TwoFactorAuthenticationComponent.
	 */
	private _subscription = new Subscription();

	/**
	 * Creates an instance of two factor authentication component.
	 * @param facade
	 * @param fb
	 * @param logger
	 */
	constructor(private facade: AccountFacadeService, private fb: FormBuilder, private logger: LogService) {
		this._authenticatorSetup$ = facade.twoFactorAuthenticationSetup$;
		this._authenticatorSetupResult$ = facade.twoFactorAuthenticationSetupResult$;
		this._problemDetails$ = facade.problemDetails$;
		this._internalServerErrorDetails$ = facade.internalServerErrorDetails$;
	}

	/**
	 * NgOnInit life cycle.
	 */
	ngOnInit(): void {
		this.logger.trace('Initialized.', this);
		this._subscription.add(
			merge(this.facade.twoFactorAuthenticationSetupResult$, this.facade.problemDetails$, this.facade.internalServerErrorDetails$)
				.pipe(
					filter((value) => value !== undefined),
					// set the _verfyingCode property to false if any of the above observables emit
					tap(() => (this._codeVerificationInProgress = false))
				)
				.subscribe()
		);

		this._subscription.add(
			merge(this.facade.onCompletedUpdateRecoveryCodesAction$, this.facade.problemDetails$, this.facade.internalServerErrorDetails$)
				.pipe(
					filter((value) => value !== undefined),
					tap(() => (this._generatingNewRecoveryCodes = false))
				)
				.subscribe()
		);

		this._initVerificationCodeForm();
	}

	/**
	 * NgOnDestroy life cycle.
	 */
	ngOnDestroy(): void {
		this.logger.trace('Destroyed.', this);
		this._subscription.unsubscribe();
	}

	/**
	 * Initializes verification code form.
	 */
	private _initVerificationCodeForm(): void {
		this._verificationCodeForm = this.fb.group({
			verificationCode: this.fb.control(
				{ value: '', disabled: true },
				{
					validators: [OdmValidators.required, OdmValidators.minLength(6), OdmValidators.maxLength(6)],
					updateOn: 'change'
				}
			)
		});
	}

	/**
	 * Event handler when user requests to enable/disable two factor authentication.
	 * @param event
	 */
	_onTwoFactorAuthToggle(event: MatSlideToggleChange): void {
		this.logger.trace('_onTwoFactorAuthToggle fired.', this);
		if (event.checked) {
			this.logger.trace('_onTwoFactorAuthToggle: enter 2fa setup.', this);
			this.facade.setupAuthenticator();
			this._showTwoFactorAuthSetupWizard = event.checked;
		} else {
			this.logger.trace('_onTwoFactorAuthToggle: disable 2fa.', this);
			this.facade.disable2Fa();
		}
	}

	/**
	 * Event handler when user cancels the two factor authentication setup wizard.
	 */
	_onCancelSetupWizard(): void {
		this.logger.trace('_onCancelSetupWizard fired.', this);
		this._showTwoFactorAuthSetupWizard = false;
		this._verificationCodeForm.reset();
		this.facade.cancel2faSetupWizard();
	}

	/**
	 * Event handler when user finishes two factor authentication setup.
	 */
	_onFinish2faSetup(event: TwoFactorAuthenticationSetupResult): void {
		this.logger.trace('_onFinish2faSetup fired.', this);
		this._showTwoFactorAuthSetupWizard = false;
		this._verificationCodeForm.reset();
		this.facade.finish2faSetup(event);
	}

	/**
	 * Event handler when user requests to generate new recovery codes.
	 */
	_onGenerateNew2FaRecoveryCodes(): void {
		this.logger.trace('_onGenerateNew2FaRecoveryCodes fired.', this);
		this._generatingNewRecoveryCodes = true;
		this.facade.generateRecoveryCodes();
	}

	/**
	 * Event handler when user requests to verify authenticator code.
	 * @param event
	 */
	_onVerifyAuthenticator(event: TwoFactorAuthenticationVerificationCode): void {
		this.logger.trace('_onVerifyAuthenticator fired.', this);
		this._codeVerificationInProgress = true;
		this.facade.verifyAuthenticator(event);
	}
}
