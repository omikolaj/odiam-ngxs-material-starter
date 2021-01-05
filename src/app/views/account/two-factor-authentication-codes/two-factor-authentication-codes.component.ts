import { Component, ChangeDetectionStrategy, Output, EventEmitter, Input } from '@angular/core';
import { TooltipTouchGestures } from '@angular/material/tooltip';
import { showDelayInMs } from 'app/shared/mat-tooltip-settings';

/**
 * Two factor authentication codes component.
 */
@Component({
	selector: 'odm-two-factor-authentication-codes',
	templateUrl: './two-factor-authentication-codes.component.html',
	styleUrls: ['./two-factor-authentication-codes.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TwoFactorAuthenticationCodesComponent {
	/**
	 * Event emitter when user requests to generate new recovery codes.
	 */
	@Output() generateNewRecoveryCodes = new EventEmitter<void>();
	/**
	 * User available recovery codes.
	 */
	@Input() codes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

	/**
	 * Touch gestrues of two factor authentication codes component.
	 */
	_touchGestrues: TooltipTouchGestures = 'on';

	_showDelayInMs = showDelayInMs;

	constructor() {}

	/**
	 * Event handler when user requests to generate new recovery codes.
	 */
	onGenerateNewRecoveryCodes(): void {
		this.generateNewRecoveryCodes.emit();
	}
}
