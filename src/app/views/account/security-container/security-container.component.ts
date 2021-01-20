import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ContentChild } from '@angular/core';
import { AccountFacadeService } from '../account-facade.service';
import { Observable, Subscription, merge, Subject, BehaviorSubject } from 'rxjs';
import { AccountSecurityDetails } from 'app/core/models/account-security-details.model';
import { LogService } from 'app/core/logger/log.service';
import { tap } from 'rxjs/internal/operators/tap';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { skip, filter } from 'rxjs/operators';
import { ODM_SPINNER_DIAMETER, ODM_SPINNER_STROKE_WIDTH } from 'app/shared/mat-spinner-settings';
import { TwoFactorAuthenticationSetupResult } from './two-factor-authentication/models/two-factor-authentication-setup-result.model';
import { TwoFactorAuthenticationSetup } from './two-factor-authentication/models/two-factor-authentication-setup.model';
import { FormGroup, FormBuilder } from '@angular/forms';
import { OdmValidators } from 'app/core/form-validators/odm-validators';
import { TwoFactorAuthenticationVerificationCode } from './two-factor-authentication/models/two-factor-authentication-verification-code.model';
import { MatSlideToggleChange, MatSlideToggle } from '@angular/material/slide-toggle';

/**
 * Component container that houses user security functionality.
 */
@Component({
	selector: 'odm-security-container',
	templateUrl: './security-container.component.html',
	styleUrls: ['./security-container.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SecurityContainerComponent implements OnInit {
	/**
	 * Account security details for the given user.
	 */
	_accountSecurityDetails$: Observable<AccountSecurityDetails>;

	_problemDetails$: Observable<ProblemDetails>;

	/**
	 * InternalServerErrorDetails for when server crashes and responds with 500 error.
	 */
	_internalServerErrorDetails$: Observable<InternalServerErrorDetails>;

	_strokeWidth = ODM_SPINNER_STROKE_WIDTH;

	_diameter = ODM_SPINNER_DIAMETER;

	/**
	 * Authenticator setup result model.
	 */
	_authenticatorSetupResult$: Observable<TwoFactorAuthenticationSetupResult>;

	/**
	 * Two factor authenticator setup.
	 */
	_authenticatorSetup$: Observable<TwoFactorAuthenticationSetup>;

	/**
	 * Verification code form for two factor authentication setup.
	 */
	_verificationCodeForm: FormGroup;

	/**
	 * Whether we are in the middle of a request to verify 2fa setup verification code.
	 */
	_codeVerificationInProgress: boolean;

	/**
	 * Whether there is an outgoing request to generate new recovery codes.
	 */
	_generatingNewRecoveryCodes: boolean;

	/**
	 * Whether there is an outgoing request to enable/disable two factor authentication.
	 */
	_twoFactorAuthToggleLoading: boolean;

	/**
	 * Show two factor auth setup wizard.
	 */
	_showTwoFactorAuthSetupWizard: boolean;

	/**
	 * Security container needs to manually emit loading values because when its loading two-factor-authentication component
	 * it is not binding any observables in the template so changing the loading value does not trigger change detection
	 */
	private _loadingSub = new BehaviorSubject<boolean>(false);

	_loading$ = this._loadingSub.asObservable();

	private _twoFactorAuthToggleLoadingSub = new BehaviorSubject<boolean>(false);

	_twoFactorAuthToggleLoading$ = this._twoFactorAuthToggleLoadingSub.asObservable();

	private _subscription = new Subscription();

	@ContentChild(MatSlideToggle) twoFactorEnabledToggle: MatSlideToggle;
	/**
	 * Creates an instance of security container component.
	 * @param facade
	 */
	constructor(private facade: AccountFacadeService, private logger: LogService, private fb: FormBuilder, private cd: ChangeDetectorRef) {
		this._accountSecurityDetails$ = facade.accountSecurityDetails$;
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
		this._loadingSub.next(true);
		this.facade.getAccountSecurityInfo();

		this._subscription.add(
			merge(this.facade.accountSecurityDetails$.pipe(skip(1)), this.facade.problemDetails$, this.facade.internalServerErrorDetails$)
				.pipe(
					filter((value) => value !== undefined),
					tap(() => this._loadingSub.next(false))
				)
				.subscribe()
		);

		this._subscription.add(
			merge(
				this.facade.twoFactorAuthenticationSetupResult$.pipe(skip(1)),
				this.facade.onCompletedUpdateRecoveryCodesAction$,
				this.facade.twoFactorAuthenticationSetup$,
				this.facade.problemDetails$,
				this.facade.internalServerErrorDetails$
			)
				.pipe(
					filter((value) => value !== undefined),
					// set the _verfyingCode property to false if any of the above observables emit
					tap(() => {
						// manual subject is NOT necessary because when codeVerificationInProgress changes to false, twoFactorAuthenticationSetupResult$ emits.
						this._codeVerificationInProgress = false;
						// manual subject is NOT necessary because when _generatingNewRecoveryCodes changes to false, onCompletedUpdateRecoveryCodesAction$ emits.
						this._generatingNewRecoveryCodes = false;

						// manual subject is necessary because when twoFactoAuthToggle changes nothing else that is bound in the template emits any values.
						this._twoFactorAuthToggleLoadingSub.next(false);
					})
				)
				.subscribe()
		);

		this._initVerificationCodeForm();
	}

	/**
	 * Event handler when user requests to enable/disable two factor authentication.
	 * @param event
	 */
	_onTwoFactorAuthToggle(event: MatSlideToggleChange): void {
		this.logger.trace('_onTwoFactorAuthToggle fired.', this);
		this._twoFactorAuthToggleLoadingSub.next(true);

		if (event.checked) {
			this.logger.trace('_onTwoFactorAuthToggle: enter 2fa setup.', this);
			this.facade.setupAuthenticator();
			// this._showTwoFactorAuthSetupWizard = event.checked;
		} else {
			this.logger.trace('_onTwoFactorAuthToggle: disable 2fa.', this);
			this.facade.disable2Fa();
		}
	}

	/**
	 * Event handler when user requests to verify authenticator code.
	 * @param event
	 */
	_verifyAuthenticatorClicked(event: TwoFactorAuthenticationVerificationCode): void {
		this.logger.trace('_onVerifyAuthenticator fired.', this);
		this._codeVerificationInProgress = true;
		this.facade.verifyAuthenticator(event);
	}

	/**
	 * Event handler when user cancels the two factor authentication setup wizard.
	 */
	_cancelSetupWizardClicked(): void {
		this.logger.trace('_onCancelSetupWizard fired.', this);
		this._showTwoFactorAuthSetupWizard = false;
		this._verificationCodeForm.reset();
		this.facade.cancel2faSetupWizard();
	}

	/**
	 * Event handler when user finishes two factor authentication setup.
	 */
	_finish2faSetupClicked(event: TwoFactorAuthenticationSetupResult): void {
		this.logger.trace('_onFinish2faSetup fired.', this);
		this._showTwoFactorAuthSetupWizard = false;
		this._verificationCodeForm.reset();
		this.facade.finish2faSetup(event);
	}

	/**
	 * Event handler when user requests to generate new recovery codes.
	 */
	_generateNew2faRecoveryCodesClicked(): void {
		this.logger.trace('_onGenerateNew2FaRecoveryCodes fired.', this);
		this._generatingNewRecoveryCodes = true;
		this.facade.generateRecoveryCodes();
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
}
