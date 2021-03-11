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
import { Observable } from 'rxjs';

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
	 * Emitted when server responds with 40X error.
	 */
	// @Input() set problemDetails(value: ProblemDetails) {
	// 	this.facade.log.debug('Problem details emitted.', this);
	// 	this._internalServerErrorDetails = null;
	// 	this._problemDetails = value;
	// }

	_problemDetails$: Observable<ProblemDetails>;

	/**
	 * Emitted when server responds with 50X error.
	 */
	// @Input() set internalServerErrorDetails(value: InternalServerErrorDetails) {
	// 	this.facade.log.debug('Internal server error emitted.', this);
	// 	this._problemDetails = null;
	// 	this._internalServerErrorDetails = value;
	// }

	_internalServerErrorDetails$: Observable<InternalServerErrorDetails>;

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
	 * Event emitter when server errors 40X or 50X have been already displayed
	 * by the two-factor-authentication-setup-wizard component.
	 */
	@Output() serverErrorHandledEmitted = new EventEmitter<boolean>();

	/**
	 * MatSlideToggle for enabling/disabling two factor authentication.
	 */
	@ViewChild('slideToggle') twoFactorEnabledToggle: MatSlideToggle;

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
	 * Creates an instance of two factor authentication component.
	 * @param facade
	 */
	constructor(private facade: AccountFacadeService) {
		this._problemDetails$ = facade.problemDetails$;
		this._internalServerErrorDetails$ = facade.internalServerErrorDetails$;
	}

	/**
	 * Event handler when user requests to enable/disable two factor authentication.
	 * @param event
	 */
	_onTwoFactorAuthToggle(event: MatSlideToggleChange): void {
		this.facade.log.trace('_onTwoFactorAuthToggle fired.', this);
		// this._removeServerErrors();
		this.twoFactorAuthToggleChanged.emit(event);
	}

	/**
	 * Event handler when user cancels the two factor authentication setup wizard.
	 */
	_onCancelSetupWizard(): void {
		this.facade.log.trace('_onCancelSetupWizard fired.', this);
		this._showTwoFactorAuthSetupWizard = false;
		// this._removeServerErrors();
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
		// this._removeServerErrors();
		this.generateNew2faRecoveryCodesClicked.emit();
	}

	/**
	 * Event handler when user requests to verify authenticator code.
	 * @param event
	 */
	_onVerifyAuthenticator(event: TwoFactorAuthenticationVerificationCode): void {
		this.facade.log.trace('_onVerifyAuthenticator fired.', this);
		// this._removeServerErrors();
		this.verifyAuthenticatorClicked.emit(event);
	}

	/**
	 * Event handler when user closes 'user codes' expansion panel.
	 */
	_onUserCodesPanelClosed(): void {
		this.facade.log.trace('_onToggleUserCodeExpasionPanel fired.', this);
		// this._removeServerErrors();
	}

	/**
	 * Event handler when server errors 40X or 50X have been displayed to the user
	 * already by the two-factor-authentication-setup-wizard component.
	 * @param handled
	 */
	_onServerErrorHandledEmitted(handled: boolean): void {
		this.serverErrorHandledEmitted.emit(handled);
	}

	// /**
	//  * Clears all server errors.
	//  */
	// private _removeServerErrors(): void {
	// 	this.facade.log.trace('_removeServerErrors errors fired.', this);
	// 	this._problemDetails = null;
	// 	this._internalServerErrorDetails = null;
	// }
}
