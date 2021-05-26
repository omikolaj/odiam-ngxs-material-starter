import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TwoFactorAuthenticationSetupResult } from 'app/core/models/account/security/two-factor-authentication-setup-result.model';
import { TwoFactorAuthenticationSetup } from 'app/core/models/account/security/two-factor-authentication-setup.model';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { OdmValidators, VerificationCodeLength } from 'app/core/form-validators/odm-validators';
import { SecuritySandboxService } from '../security-sandbox.service';
import { Observable, Subscription, merge } from 'rxjs';
import { TwoFactorAuthenticationVerificationCode } from 'app/core/models/account/security/two-factor-authentication-verification-code.model';
import { ActivatedRoute } from '@angular/router';
import { tap, skip } from 'rxjs/operators';
import { ROUTE_ANIMATIONS_ELEMENTS } from 'app/core/core.module';

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
	 * Route animations.
	 */
	readonly _routeAnimationsElements = ROUTE_ANIMATIONS_ELEMENTS;

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
	 * Authenticator setup result model.
	 */
	authenticatorSetupResult$: Observable<TwoFactorAuthenticationSetupResult>;

	/**
	 * Rxjs subscriptions for this component.
	 */
	private readonly _subscription = new Subscription();

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
		this._subscription.add(this._listenForServerErrors$().subscribe());
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
		void this._sb.router.navigate(['./'], { relativeTo: this._route.parent });
		this._sb.finish2faSetup(event);
	}

	/**
	 * Subscribes to server errors and sets problem details and internal server error details.
	 */
	private _listenForServerErrors$(): Observable<ProblemDetails | InternalServerErrorDetails | TwoFactorAuthenticationSetupResult> {
		this._sb.log.trace('_listenForServerErrors$ fired.', this);
		return merge(
			this._sb.problemDetails$,
			this._sb.internalServerErrorDetails$,
			// skip first value that emits, which is the default value.
			this._authenticatorSetupResult$.pipe(skip(1))
		).pipe(tap(() => (this._codeVerificationInProgress = false)));
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
