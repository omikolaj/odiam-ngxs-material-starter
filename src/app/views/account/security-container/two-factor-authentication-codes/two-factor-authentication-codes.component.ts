import { Component, ChangeDetectionStrategy, Output, EventEmitter, Input } from '@angular/core';
import { TooltipTouchGestures } from '@angular/material/tooltip';
import { ODM_TOOLTIP_SHOW_DELAY_IN_MS } from 'app/shared/mat-tooltip-settings';
import { AccountFacadeService } from '../../account-facade.service';
import { fadeInAnimation, upDownFadeInAnimation } from 'app/core/core.module';

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
	 * Event emitter when user requests to generate new recovery codes.
	 */
	@Output() generateNewRecoveryCodes = new EventEmitter<void>();

	/**
	 * Event emitter when user closes the 'user codes' expansion panel.
	 */
	@Output() userCodesPanelClosed = new EventEmitter<void>();

	/**
	 * Recovery codes user has left to redeem for logging in.
	 */
	@Input() codes: string[] = [];

	/**
	 * Whether there is an outgoing request to generate new recovery codes.
	 */
	@Input() generatingCodes = false;

	/**
	 * Whether the mat-expansien-panel should disallow user to expand it.
	 */
	@Input() disabled = false;

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
	constructor(private facade: AccountFacadeService) {}

	/**
	 * Event handler when user requests to generate new recovery codes.
	 */
	_onGenerateNewRecoveryCodes(): void {
		this.facade.log.trace('_onGenerateNewRecoveryCodes fired.', this);
		this.generateNewRecoveryCodes.emit();
	}

	/**
	 * Event handler when user closes expansion panel.
	 */
	_onUserCodesClosed(): void {
		this.facade.log.trace('_onTogglePosition fired.', this);
		this.userCodesPanelClosed.emit();
	}
}
