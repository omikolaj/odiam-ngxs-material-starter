import { Component, ChangeDetectionStrategy, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { MatSlideToggleChange, MatSlideToggle } from '@angular/material/slide-toggle';
import { FormGroup } from '@angular/forms';
import { ROUTE_ANIMATIONS_ELEMENTS, downUpFadeInAnimation } from 'app/core/core.module';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { Observable, merge } from 'rxjs';
import { ODM_SMALL_SPINNER_DIAMETER, ODM_SMALL_SPINNER_STROKE_WIDTH } from 'app/shared/global-settings/mat-spinner-settings';
import { TwoFactorAuthenticationSetup } from 'app/core/models/account/security/two-factor-authentication-setup.model';
import { TwoFactorAuthenticationSetupResult } from 'app/core/models/account/security/two-factor-authentication-setup-result.model';
import { TwoFactorAuthenticationVerificationCode } from 'app/core/models/account/security/two-factor-authentication-verification-code.model';
import { filter } from 'rxjs/operators';
import { InternalServerError } from 'app/core/error-handler/internal-server-error.decorator';
import { ProblemDetailsError } from 'app/core/error-handler/problem-details-error.decorator';
import { LogService } from 'app/core/logger/log.service';

/**
 * Two factor authentication component responsible for handling user's 2fa settings.
 */
@Component({
	selector: 'odm-two-factor-authentication',
	templateUrl: './two-factor-authentication.component.html',
	styleUrls: ['./two-factor-authentication.component.scss'],
	animations: [downUpFadeInAnimation],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TwoFactorAuthenticationComponent {
	/**
	 * Whether the two factor authentication data is being fetched.
	 */
	@Input() loading: boolean;

	/**
	 * User's two factor authentication setting state (enabled/disabled).
	 */
	@Input() twoFactorEnabled: boolean;

	/**
	 * Recovery codes user has left to redeem for logging in.
	 */
	@Input() userRecoveryCodes: string[] = [];

	/**
	 * Whether there is an outgoing request to enable/disable two factor authentication.
	 */
	@Input() set twoFactorAuthToggleLoading(value: boolean) {
		this._log.debug('twoFactorAuthToggleLoading emitted.', this);
		this._twoFactorAuthToggleLoading = value;

		setTimeout(() => {
			if (this.twoFactorEnabledToggle) {
				this.twoFactorEnabledToggle.checked = this.twoFactorEnabled;
			}
		});
	}

	_twoFactorAuthToggleLoading = false;

	/**
	 * Two factor authentication setup information.
	 */
	@Input() set authenticatorSetup(value: TwoFactorAuthenticationSetup) {
		this._log.debug('authenticatorSetup emitted.', this);
		this._authenticatorSetup = value;
		if (value.authenticatorUri !== '' && value.sharedKey !== '') {
			// Notifies parent that two fa setup wizard is displayed.
			this._showTwoFactorAuthSetupWizard = true;
		}
	}

	_authenticatorSetup: TwoFactorAuthenticationSetup;

	/**
	 * Verification code form for two factor authentication setup.
	 */
	@Input() verificationCodeForm: FormGroup;

	/**
	 * Authenticator setup result model.
	 */
	@Input() authenticatorSetupResult: TwoFactorAuthenticationSetupResult;

	/**
	 * Whether we are in the middle of a request to verify two factor authentication setup verification code.
	 */
	@Input() codeVerificationInProgress: boolean;

	/**
	 * Whether there is an outgoing request to generate new recovery codes.
	 */
	@Input() generatingNewRecoveryCodes: boolean;

	/**
	 * Event emitter when user submits verification code.
	 */
	@Output() verifyAuthenticatorClicked = new EventEmitter<TwoFactorAuthenticationVerificationCode>();

	/**
	 * Event emitter when user cancels out of the setup wizard.
	 */
	@Output() cancelSetupWizardClicked = new EventEmitter<void>();

	/**
	 * Event emitter when user finishes two factor authentication setup.
	 */
	@Output() finish2faSetupClicked = new EventEmitter<TwoFactorAuthenticationSetupResult>();

	/**
	 * Event emitter when user requests to generate new recovery codes.
	 */
	@Output() generateNew2faRecoveryCodesClicked = new EventEmitter<void>();

	/**
	 * Event emitter when user toggles between enabling/disabling two factor auth.
	 */
	@Output() twoFactorAuthToggleChanged = new EventEmitter<MatSlideToggleChange>();

	/**
	 * MatSlideToggle for enabling/disabling two factor authentication.
	 */
	@ViewChild('slideToggle') twoFactorEnabledToggle: MatSlideToggle;

	/**
	 * Emitted when server responds with 40X error.
	 * This component has to have a separate stream for problem details. If security container component emits
	 * a value, the app should not re-display that same error. Instead it should wait for errors from the point it got
	 * a reference to this stream. No reason to inject account-sandbox.service just for these streams. Using decorators instead.
	 */
	@ProblemDetailsError() _problemDetails$: Observable<ProblemDetails>;

	/**
	 * Emitted when server responds with 50X error.
	 * This component has to have a separate stream for problem details. If security container component emits
	 * a value, the app should not re-display that same error. Instead it should wait for errors from the point it got
	 * a reference to this stream. No reason to inject account-sandbox.service just for these streams. Using decorators instead.
	 */
	@InternalServerError() _internalServerErrorDetails$: Observable<InternalServerErrorDetails>;

	/**
	 * Emitted when server responds with 40X or 50x error.
	 * Used in components that display server side errors without using AbstractControl.
	 */
	_serverError$: Observable<ProblemDetails | InternalServerErrorDetails>;

	/**
	 * Whether to display two factor auth setup wizard.
	 */
	_showTwoFactorAuthSetupWizard = false;

	/**
	 * Route animations.
	 */
	readonly _routeAnimationsElements = ROUTE_ANIMATIONS_ELEMENTS;

	/**
	 * Two factor auth toggle spinner diameter.
	 */
	readonly _twoFactorAuthToggleSpinnerDiameter = ODM_SMALL_SPINNER_DIAMETER;

	/**
	 * Two factor auth toggle spinner stroke width.
	 */
	readonly _twoFactorAuthToggleSpinnerStrokeWidth = ODM_SMALL_SPINNER_STROKE_WIDTH;

	/**
	 * Used to filter out server side errors for two factor authentication codes that occur before the panel is opened.
	 */
	private _userRecoveryCodesOpened = false;

	/**
	 * Creates an instance of two factor authentication component.
	 * @param _log
	 */
	constructor(private _log: LogService) {
		this._serverError$ = merge(this._problemDetails$, this._internalServerErrorDetails$).pipe(filter(() => this._userRecoveryCodesOpened === true));
	}

	/**
	 * Event handler when user requests to enable/disable two factor authentication.
	 * @param event
	 */
	_onTwoFactorAuthToggleChanged(event: MatSlideToggleChange): void {
		this._log.trace('_onTwoFactorAuthToggle fired.', this);
		this.twoFactorAuthToggleChanged.emit(event);
	}

	/**
	 * Event handler when user cancels the two factor authentication setup wizard.
	 */
	_onCancelSetupWizardClicked(): void {
		this._log.trace('_onCancelSetupWizard fired.', this);
		this._showTwoFactorAuthSetupWizard = false;
		this.cancelSetupWizardClicked.emit();
	}

	/**
	 * Event handler when user finishes two factor authentication setup.
	 */
	_onFinish2faSetupClicked(event: TwoFactorAuthenticationSetupResult): void {
		this._log.trace('_onFinish2faSetup fired.', this);
		this._showTwoFactorAuthSetupWizard = false;
		this.finish2faSetupClicked.emit(event);
	}

	/**
	 * Event handler when user requests to generate new recovery codes.
	 */
	_onGenerateNew2FaRecoveryCodesClicked(): void {
		this._log.trace('_onGenerateNew2FaRecoveryCodes fired.', this);
		this.generateNew2faRecoveryCodesClicked.emit();
	}

	/**
	 * Event handler when user requests to verify authenticator code.
	 * @param event
	 */
	_onVerifyAuthenticatorSubmitted(event: unknown): void {
		this._log.trace('_onVerifyAuthenticator fired.', this);
		this.verifyAuthenticatorClicked.emit(event as TwoFactorAuthenticationVerificationCode);
	}
}
