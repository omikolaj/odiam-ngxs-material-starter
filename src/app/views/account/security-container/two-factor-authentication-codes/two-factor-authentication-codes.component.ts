import { Component, ChangeDetectionStrategy, Output, EventEmitter, Input } from '@angular/core';
import { TooltipTouchGestures } from '@angular/material/tooltip';
import { ODM_TOOLTIP_SHOW_DELAY_IN_MS } from 'app/shared/mat-tooltip-settings';
import { LogService } from 'app/core/logger/log.service';
import { upDownFadeInAnimation, fadeInAnimation } from 'app/core/animations/element.animations';

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
	 * Recovery codes user has left to redeem for logging in.
	 */
	@Input() codes: string[] = [];

	/**
	 * Determines whether there is an outgoing request to generate new recovery codes.
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
	 * Show delay in ms for toolip.
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
	 * @param logger
	 */
	constructor(private logger: LogService) {}

	/**
	 * Event handler when user requests to generate new recovery codes.
	 */
	_onGenerateNewRecoveryCodes(): void {
		this.logger.trace('_onGenerateNewRecoveryCodes fired.', this);
		this.generateNewRecoveryCodes.emit();
	}
}
