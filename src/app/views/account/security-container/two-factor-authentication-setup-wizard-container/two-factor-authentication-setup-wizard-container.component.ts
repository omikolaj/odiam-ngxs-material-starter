import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TwoFactorAuthenticationSetupResult } from 'app/core/models/account/security/two-factor-authentication-setup-result.model';
import { TwoFactorAuthenticationSetup } from 'app/core/models/account/security/two-factor-authentication-setup.model';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { OdmValidators, VerificationCodeLength } from 'app/core/form-validators/odm-validators';
import { SecuritySandboxService } from '../security-sandbox.service';
import { Observable } from 'rxjs';
import { TwoFactorAuthenticationVerificationCode } from 'app/core/models/account/security/two-factor-authentication-verification-code.model';
import { ActivatedRoute } from '@angular/router';

/**
 * Two factor authentication setup wizard container component.
 */
@Component({
	selector: 'odm-two-factor-authentication-setup-wizard-container',
	templateUrl: './two-factor-authentication-setup-wizard-container.component.html',
	styleUrls: ['./two-factor-authentication-setup-wizard-container.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TwoFactorAuthenticationSetupWizardContainerComponent implements OnInit {
	/**
	 * Verification code form for two factor authentication setup.
	 */
	_verificationCodeForm: FormGroup;

	/**
	 * Authenticator setup result model.
	 */
	_authenticatorSetupResult$: Observable<TwoFactorAuthenticationSetupResult>;

	/**
	 * Two factor authenticator setup.
	 */
	_authenticatorSetup$: Observable<TwoFactorAuthenticationSetup>;

	/**
	 * Whether we are in the middle of a request to verify two factor authentication setup verification code.
	 */
	_codeVerificationInProgress: boolean;

	/**
	 * Emitted when server responds with 40X error.
	 */
	_problemDetails$: Observable<ProblemDetails>;

	/**
	 * Emitted when server responds with 50X error.
	 */
	_internalServerErrorDetails$: Observable<InternalServerErrorDetails>;

	/**
	 * Creates an instance of two factor authentication setup wizard container component.
	 * @param _sb
	 */
	constructor(private _sb: SecuritySandboxService, private _route: ActivatedRoute) {
		this._authenticatorSetup$ = _sb.twoFactorAuthenticationSetup$;
		this._authenticatorSetupResult$ = _sb.twoFactorAuthenticationSetupResult$;
		this._problemDetails$ = _sb.problemDetails$;
		this._internalServerErrorDetails$ = _sb.internalServerErrorDetails$;
	}

	/**
	 * ngOnInit life cycle.
	 */
	ngOnInit(): void {
		this._sb.log.trace('Initialized.', this);
		this._verificationCodeForm = this._initVerificationCodeForm();
	}

	/**
	 * Event handler when user requests to verify authenticator code.
	 * @param event
	 */
	_onVerifyAuthenticatorSubmitted(event: TwoFactorAuthenticationVerificationCode): void {
		this._sb.log.trace('_onVerifyAuthenticator fired.', this);
		this._codeVerificationInProgress = true;
		this._sb.verifyAuthenticator(event);
	}

	/**
	 * Event handler when user cancels the two factor authentication setup wizard.
	 * This is also emitted when two factor authentication setup wizard's ngOnDestroy life cycle is called.
	 */
	_onCancelSetupWizardClicked(): void {
		this._sb.log.trace('_onCancelSetupWizard fired.', this);
		this._verificationCodeForm.reset();
		void this._sb.router.navigate(['./'], { relativeTo: this._route.parent });
		this._sb.cancel2faSetupWizard();
	}

	/**
	 * Event handler when user finishes two factor authentication setup.
	 */
	_onFinish2faSetupClicked(event: TwoFactorAuthenticationSetupResult): void {
		this._sb.log.trace('_onFinish2faSetup fired.', this);
		this._verificationCodeForm.reset();
		this._sb.finish2faSetup(event);
	}

	/**
	 * Initializes verification code form.
	 */
	private _initVerificationCodeForm(): FormGroup {
		return this._sb.fb.group({
			code: this._sb.fb.control(
				{ value: '', disabled: true },
				{
					validators: [OdmValidators.required, OdmValidators.minLength(VerificationCodeLength), OdmValidators.maxLength(VerificationCodeLength)],
					updateOn: 'change'
				}
			)
		});
	}
}
