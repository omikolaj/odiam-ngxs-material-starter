import { Component, ChangeDetectionStrategy, Input, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatSlideToggleChange, MatSlideToggle } from '@angular/material/slide-toggle';
import { AccountFacadeService } from '../../account-facade.service';
import { Observable, merge, Subscription } from 'rxjs';
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
import { fadeInAnimation, upDownFadeInAnimation } from 'app/core/animations/element.animations';
import { skip } from 'rxjs/internal/operators/skip';
import { implementsOdmWebApiException } from 'app/core/utilities/implements-odm-web-api-exception';

/**
 * Component responsible for handling two factor authentication settings.
 */
@Component({
	selector: 'odm-two-factor-authentication',
	templateUrl: './two-factor-authentication.component.html',
	styleUrls: ['./two-factor-authentication.component.scss'],
	animations: [fadeInAnimation, upDownFadeInAnimation],
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
	 * Indicates whether problem details error has been handled.
	 */
	private _problemDetailsErrorHandled = false;

	/**
	 * Indicates whether internal server error has been handled.
	 */
	private _internalServerErrorHandled = false;

	/**
	 * Whether the two factor authentication data is being fetched.
	 */
	@Input() loading: boolean;

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
	 * Whether there is an outgoing request to enable/disable two factor authentication.
	 */
	_twoFactorAuthToggleLoading: boolean;

	/**
	 * Two factor auth toggle spinner diameter.
	 */
	_twoFactorAuthToggleSpinnerDiameter = 15;

	/**
	 * Two factor auth toggle spinner stroke width.
	 */
	_twoFactorAuthToggleSpinnerStrokeWidth = 1;

	/**
	 * MatSlideToggle for enabling/disabling two factor authentication.
	 */
	@ViewChild('slideToggle') twoFactorEnabledToggle: MatSlideToggle;

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

	// private _serverError$: Observable<ProblemDetails | InternalServerErrorDetails>;

	/**
	 * Creates an instance of two factor authentication component.
	 * @param facade
	 * @param fb
	 * @param logger
	 */
	constructor(private facade: AccountFacadeService, private fb: FormBuilder, private logger: LogService, private cd: ChangeDetectorRef) {
		this._authenticatorSetup$ = facade.twoFactorAuthenticationSetup$;
		this._authenticatorSetupResult$ = facade.twoFactorAuthenticationSetupResult$;
		this._problemDetails$ = facade.problemDetails$.pipe(
			tap(() => {
				// if problem details emitted it means its new thus not handled.
				this._problemDetailsErrorHandled = false;
				// only display one error either problem details or internal server error.
				this._internalServerErrorHandled = true;
			})
		);
		this._internalServerErrorDetails$ = facade.internalServerErrorDetails$.pipe(
			tap(() => {
				// if problem details emitted it means its new thus not handled.
				this._internalServerErrorHandled = false;
				// only display one error either problem details or internal server error.
				this._problemDetailsErrorHandled = true;
			})
		);
	}

	/**
	 * NgOnInit life cycle.
	 */
	ngOnInit(): void {
		this.logger.trace('Initialized.', this);

		this._subscription.add(
			merge(
				this.facade.twoFactorAuthenticationSetupResult$.pipe(skip(1)),
				this.facade.onCompletedUpdateRecoveryCodesAction$,
				this.facade.problemDetails$,
				this.facade.internalServerErrorDetails$
			)
				.pipe(
					filter((value) => value !== undefined),
					// set the _verfyingCode property to false if any of the above observables emit
					tap(() => {
						this._codeVerificationInProgress = false;
						this._generatingNewRecoveryCodes = false;
					})
				)
				.subscribe()
		);

		this._subscription.add(
			merge(this.facade.twoFactorAuthenticationSetup$, this.facade.problemDetails$, this.facade.internalServerErrorDetails$)
				.pipe(
					filter((value) => value !== undefined),
					tap(() => {
						// if twoFactorAuthenticationSetup or problemDetails or internalServerErrorDetails emit a value, set _twoFactorAuthToggleLoading to false.
						this._twoFactorAuthToggleLoading = false;
						// when setup wizard is displayed mat-slide-toggle is undefined. This is used control accurate state of the mat-slide-toggle.
						// If request to disable the toggle fails, set it back to original value.
						if (this.twoFactorEnabledToggle) {
							this.twoFactorEnabledToggle.checked = this.twoFactorEnabled;
						}
					}),
					// filter out any types that are not TwoFactorAuthenticationSetup
					filter((value) => this._isTwoFactorAuthenticationSetup(value)),
					// filter out any TwoFactorAuthenticationSetup that only contain default values.
					filter((value: TwoFactorAuthenticationSetup) => this._doesTwoFactorAuthenticationSetupHaveValues(value)),
					tap(() => {
						this._showTwoFactorAuthSetupWizard = true;
						// Manual change detection is necessary to display setup wizard.
						this.cd.detectChanges();
					})
				)
				.subscribe()
		);

		this._initVerificationCodeForm();
	}

	/**
	 * Determines if TwoFactorAuthenticationSetup contains values sent from the server and not just defaults.
	 * @param value
	 * @returns true if two factor authentication setup have values
	 */
	_doesTwoFactorAuthenticationSetupHaveValues(value: TwoFactorAuthenticationSetup): boolean {
		return value.authenticatorUri !== '' && value.sharedKey !== '';
	}

	/**
	 * Determines whether value is of type TwoFactorAuthenticationSetup.
	 * @param value
	 * @returns TwoFactorAuthenticationSetup type.
	 */
	_isTwoFactorAuthenticationSetup(
		value: TwoFactorAuthenticationSetup | ProblemDetails | InternalServerErrorDetails
	): value is TwoFactorAuthenticationSetup {
		return (value as TwoFactorAuthenticationSetup).authenticatorUri !== undefined && (value as TwoFactorAuthenticationSetup).sharedKey !== undefined;
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
		this._twoFactorAuthToggleLoading = true;

		// if any server errors were displayed set them all to handled.
		this._internalServerErrorHandled = true;
		this._problemDetailsErrorHandled = true;

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

	/**
	 * Gets problem details error message.
	 * @returns problem details error message
	 */
	_getProblemDetailsErrorMessage(error: ProblemDetails): string {
		if (this._problemDetailsErrorHandled === false) {
			return error.detail;
		}
	}

	/**
	 * Gets internal server error message.
	 * @returns internal server error message
	 */
	_getInternalServerErrorMessage(error: InternalServerErrorDetails): string {
		if (this._internalServerErrorHandled === false) {
			if (implementsOdmWebApiException(error)) {
				return error.detail;
			} else {
				return (error as InternalServerErrorDetails).message;
			}
		}
	}

	/**
	 * Determines whether internal server error occured.
	 * @param error
	 * @returns true if internal server error
	 */
	_isInternalServerError(error: InternalServerErrorDetails): boolean {
		return !!error && this._internalServerErrorHandled === false && !this.loading;
	}

	/**
	 * Determines whether problem details error occured.
	 * @param error
	 * @returns true if problem details error
	 */
	_isProblemDetailsError(error: ProblemDetails): boolean {
		return !!error && this._problemDetailsErrorHandled === false && !this.loading;
	}
}
