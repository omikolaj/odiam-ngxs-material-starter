import { Component, ChangeDetectionStrategy, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { MatSlideToggleChange, MatSlideToggle } from '@angular/material/slide-toggle';
import { ROUTE_ANIMATIONS_ELEMENTS, downUpFadeInAnimation } from 'app/core/core.module';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { ODM_SMALL_SPINNER_DIAMETER, ODM_SMALL_SPINNER_STROKE_WIDTH } from 'app/shared/global-settings/mat-spinner-settings';
import { LogService } from 'app/core/logger/log.service';
import { ODM_GLOBAL_SECURITY_SHORT_DESCRIPTION } from 'app/shared/global-settings/global-settings';
import { ActivatedRoute, Router } from '@angular/router';
import { TwoFactorAuthenticationSetup } from 'app/core/models/account/security/two-factor-authentication-setup.model';

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
	 * Emitted when server responds with 40X error.
	 */
	@Input() set problemDetails(value: ProblemDetails) {
		this._problemDetails = value;
	}

	_problemDetails: ProblemDetails;

	/**
	 * Emitted when server responds with 50X error.
	 */
	@Input() set internalServerErrorDetails(value: InternalServerErrorDetails) {
		this._internalServerErrorDetails = value;
	}

	_internalServerErrorDetails: InternalServerErrorDetails;

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
			void this._router.navigate(['two-factor-authentication-setup'], { relativeTo: this._route.parent });
		}
	}

	_authenticatorSetup: TwoFactorAuthenticationSetup;

	/**
	 * Whether there is an outgoing request to generate new recovery codes.
	 */
	@Input() generatingNewRecoveryCodes: boolean;

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
	 * Whether to display two factor auth setup wizard.
	 */
	_showTwoFactorAuthSetupWizard = false;

	/**
	 * Route animations.
	 */
	readonly _routeAnimationsElements = ROUTE_ANIMATIONS_ELEMENTS;

	/**
	 * Short description font size.
	 */
	readonly _shortDescriptionFontSize = ODM_GLOBAL_SECURITY_SHORT_DESCRIPTION;

	/**
	 * Two factor auth toggle spinner diameter.
	 */
	readonly _twoFactorAuthToggleSpinnerDiameter = ODM_SMALL_SPINNER_DIAMETER;

	/**
	 * Two factor auth toggle spinner stroke width.
	 */
	readonly _twoFactorAuthToggleSpinnerStrokeWidth = ODM_SMALL_SPINNER_STROKE_WIDTH;

	/**
	 * Creates an instance of two factor authentication component.
	 * @param _log
	 */
	constructor(private _log: LogService, private _router: Router, private _route: ActivatedRoute) {}

	/**
	 * Event handler when user requests to enable/disable two factor authentication.
	 * @param event
	 */
	_onTwoFactorAuthToggleChanged(event: MatSlideToggleChange): void {
		this._log.trace('_onTwoFactorAuthToggle fired.', this);
		this._clearServerErrors();
		this.twoFactorAuthToggleChanged.emit(event);
	}

	/**
	 * Event handler when user requests to generate new recovery codes.
	 */
	_onGenerateNew2FaRecoveryCodesClicked(): void {
		this._log.trace('_onGenerateNew2FaRecoveryCodes fired.', this);
		this._clearServerErrors();
		this.generateNew2faRecoveryCodesClicked.emit();
	}

	/**
	 * Clears server errors. On each event handled by this component clear server errors.
	 */
	private _clearServerErrors(): void {
		this._log.trace('_clearServerErrors fired.', this);
		this._problemDetails = null;
		this._internalServerErrorDetails = null;
	}
}
