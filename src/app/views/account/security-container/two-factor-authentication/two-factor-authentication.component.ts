import { Component, ChangeDetectionStrategy, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { MatSlideToggleChange, MatSlideToggle } from '@angular/material/slide-toggle';
import { TwoFactorAuthenticationSetup } from 'app/views/account/security-container/two-factor-authentication/models/two-factor-authentication-setup.model';
import { FormGroup } from '@angular/forms';
import { TwoFactorAuthenticationSetupResult } from 'app/views/account/security-container/two-factor-authentication/models/two-factor-authentication-setup-result.model';
import { TwoFactorAuthenticationVerificationCode } from 'app/views/account/security-container/two-factor-authentication/models/two-factor-authentication-verification-code.model';
import { AccountFacadeService } from '../../account-facade.service';
import { upDownFadeInAnimation, fadeInAnimation } from 'app/core/core.module';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { Observable, merge } from 'rxjs';
import { filter } from 'rxjs/operators';

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
		this.facade.log.debug('twoFactorAuthToggleLoading emitted.', this);
		this._twoFactorAuthToggleLoading = value;

		// allow for any problemDetails or internalServerErrors to be emitted. This defers the execution.
		setTimeout(() => {
			// if (this.twoFactorEnabledToggle && (this._problemDetails || this._internalServerErrorDetails)) {

			// }
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
		this.facade.log.debug('authenticatorSetup emitted.', this);
		this._authenticatorSetup = value;
		if (value.authenticatorUri !== '' && value.sharedKey !== '') {
			this._showTwoFactorAuthSetupWizard = true;
			// Notifies parent that two fa setup wizard is displayed.
			// Used to control the display of server side errors.
			this.serverErrorHandled.emit();
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
	 * Event emitter when two factor auth setup wizard is displayed.
	 */
	@Output() serverErrorHandled = new EventEmitter<void>();

	/**
	 * Event emitter when user recovery codes panel is opened.
	 */
	@Output() userRecoveryCodesOpened = new EventEmitter<void>();

	/**
	 * Event emitter when user recovery codes panel is opened.
	 */
	@Output() userRecoveryCodesClosed = new EventEmitter<void>();

	/**
	 * MatSlideToggle for enabling/disabling two factor authentication.
	 */
	@ViewChild('slideToggle') twoFactorEnabledToggle: MatSlideToggle;

	/**
	 * Emitted when server responds with 40X error.
	 * Used in components that display server side errors by invalidating AbstractControl on a form.
	 */
	_problemDetails$: Observable<ProblemDetails>;

	/**
	 * Emitted when server responds with 50X error.
	 * Used in components that display server side errors by invalidating AbstractControl on a form.
	 */
	_internalServerErrorDetails$: Observable<InternalServerErrorDetails>;

	/**
	 * Emitted when server responds with 40X or 50x error.
	 * Used in components that display server side errors without using AbstractControl.
	 */
	_serverError$: Observable<ProblemDetails | InternalServerErrorDetails>;

	/**
	 * Two factor auth toggle spinner diameter.
	 */
	_twoFactorAuthToggleSpinnerDiameter = 15;

	/**
	 * Two factor auth toggle spinner stroke width.
	 */
	_twoFactorAuthToggleSpinnerStrokeWidth = 1;

	/**
	 * Show two factor auth setup wizard.
	 */
	_showTwoFactorAuthSetupWizard = false;

	/**
	 * Used to filter out server side errors for two factor authentication codes that occur before the panel is opened.
	 */
	private _userRecoveryCodesOpened = false;

	/**
	 * Creates an instance of two factor authentication component.
	 * @param facade
	 */
	constructor(private facade: AccountFacadeService) {
		this._problemDetails$ = facade.problemDetails$;
		this._internalServerErrorDetails$ = facade.internalServerErrorDetails$;
		// filters out server errors that might have been displayed prior to opening up user recovery codes.
		this._serverError$ = merge(facade.problemDetails$, facade.internalServerErrorDetails$).pipe(filter(() => this._userRecoveryCodesOpened === true));
	}

	/**
	 * Event handler when user requests to enable/disable two factor authentication.
	 * @param event
	 */
	_onTwoFactorAuthToggle(event: MatSlideToggleChange): void {
		this.facade.log.trace('_onTwoFactorAuthToggle fired.', this);
		this.twoFactorAuthToggleChanged.emit(event);
	}

	/**
	 * Event handler when user cancels the two factor authentication setup wizard.
	 */
	_onCancelSetupWizard(): void {
		this.facade.log.trace('_onCancelSetupWizard fired.', this);
		this._showTwoFactorAuthSetupWizard = false;
		this.cancelSetupWizardClicked.emit();
	}

	/**
	 * Event handler when user finishes two factor authentication setup.
	 */
	_onFinish2faSetup(event: TwoFactorAuthenticationSetupResult): void {
		this.facade.log.trace('_onFinish2faSetup fired.', this);
		this._showTwoFactorAuthSetupWizard = false;
		this.finish2faSetupClicked.emit(event);
	}

	/**
	 * Event handler when user requests to generate new recovery codes.
	 */
	_onGenerateNew2FaRecoveryCodes(): void {
		this.facade.log.trace('_onGenerateNew2FaRecoveryCodes fired.', this);
		this.generateNew2faRecoveryCodesClicked.emit();
	}

	/**
	 * Event handler when user requests to verify authenticator code.
	 * @param event
	 */
	_onVerifyAuthenticator(event: TwoFactorAuthenticationVerificationCode): void {
		this.facade.log.trace('_onVerifyAuthenticator fired.', this);
		this.verifyAuthenticatorClicked.emit(event);
	}

	/**
	 * Event handler when user opens 'user codes' expansion panel.
	 */
	_onUserRecoveryCodesOpened(): void {
		this.facade.log.trace('_onUserRecoveryCodesOpened fired.', this);
		this._userRecoveryCodesOpened = true;
		this.userRecoveryCodesOpened.emit();
	}

	/**
	 * Event handler when user closes 'user codes' expansion panel.
	 */
	_onUserCodesPanelClosed(): void {
		this.facade.log.trace('_onUserCodesPanelClosed fired.', this);
		// ensures parent component cleans up any errors that it might be displaying.
		this._userRecoveryCodesOpened = false;
		// indicates to the parent component that any server errors that have occured were already handled and displayed.
		this.serverErrorHandled.emit();
		this.userRecoveryCodesClosed.emit();
	}

	/**
	 * Event handler when server errors 40X or 50X have been displayed to the user
	 * already by the two-factor-authentication-setup-wizard component or two-factor-authentication-codes component.
	 * @param handled
	 */
	_onServerErrorHandled(): void {
		this.facade.log.trace('_onServerErrorHandled fired.', this);
		this.serverErrorHandled.emit();
	}
}
