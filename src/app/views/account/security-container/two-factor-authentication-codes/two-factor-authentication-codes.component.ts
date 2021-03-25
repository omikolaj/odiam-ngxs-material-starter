import { Component, ChangeDetectionStrategy, Output, EventEmitter, Input } from '@angular/core';
import { TooltipTouchGestures } from '@angular/material/tooltip';
import { ODM_TOOLTIP_SHOW_DELAY_IN_MS } from 'app/shared/global-settings/mat-tooltip-settings';

import { fadeInAnimation, upDownFadeInAnimation } from 'app/core/core.module';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { LogService } from 'app/core/logger/log.service';

/**
 * Two factor authentication codes component.
 */
@Component({
	selector: 'odm-two-factor-authentication-codes',
	templateUrl: './two-factor-authentication-codes.component.html',
	styleUrls: ['./two-factor-authentication-codes.component.scss'],
	animations: [upDownFadeInAnimation, fadeInAnimation],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TwoFactorAuthenticationCodesComponent {
	/**
	 * Event emitter when server responds with 40X or 50X error.
	 */
	@Input() set serverError(value: ProblemDetails | InternalServerErrorDetails) {
		this.log.debug('serverError emitted.', this);
		this._serverError = value;
	}

	_serverError: ProblemDetails | InternalServerErrorDetails;

	/**
	 * Recovery codes user has left to redeem for logging in.
	 */
	@Input() set codes(value: string[]) {
		this.log.debug('codes emitted.', this);
		this._codes = value;
		// each time we successfully emit new codes null out serverError.
		this._removeServerError();
	}

	_codes: string[] = [];

	/**
	 * Whether there is an outgoing request to generate new recovery codes.
	 */
	@Input() generatingCodes = false;

	/**
	 * Whether the mat-expansien-panel should disallow user to expand it.
	 */
	@Input() disabled = false;

	/**
	 * Event emitter when user requests to generate new recovery codes.
	 */
	@Output() generateNewRecoveryCodesClicked = new EventEmitter<void>();

	/**
	 * Event emitter when user closes the 'user codes' expansion panel.
	 */
	@Output() userCodesPanelClosed = new EventEmitter<void>();

	/**
	 * Event emitter when user opens the 'user codes' expansion panel.
	 */
	@Output() userCodesPanelOpened = new EventEmitter<void>();

	/**
	 * Touch gestrues of two factor authentication codes component.
	 */
	_touchGestrues: TooltipTouchGestures = 'on';

	/**
	 * Delay in ms for toolip.
	 */
	_showDelayInMs = ODM_TOOLTIP_SHOW_DELAY_IN_MS;

	/**
	 * Generating recovery codes spinner diameter.
	 */
	_generatingCodesSpinnerDiameter = 15;

	/**
	 * Generating recovery codes spinner stroke width.
	 */
	_generatingCodesSpinnerStrokeWidth = 1;

	/**
	 * Creates an instance of two factor authentication codes component.
	 * @param facade
	 */
	constructor(private log: LogService) {}

	/**
	 * Event handler when user requests to generate new recovery codes.
	 */
	_onGenerateNewRecoveryCodes(): void {
		this.log.trace('_onGenerateNewRecoveryCodes fired.', this);
		this.generateNewRecoveryCodesClicked.emit();
	}

	/**
	 * Event handler when user closes expansion panel.
	 */
	_onUserCodesClosed(): void {
		this.log.trace('_onUserCodesClosed fired.', this);
		this._removeServerError();
		this.userCodesPanelClosed.emit();
	}

	/**
	 * Event handler when user opens expansion panel.
	 */
	_onUserCodesOpened(): void {
		this.log.trace('_onUserCodesOpened fired.', this);
		this.userCodesPanelOpened.emit();
	}

	/**
	 * Sets serverError to null.
	 */
	private _removeServerError(): void {
		this.log.trace('_removeServerError fired.', this);
		this.serverError = null;
	}
}
