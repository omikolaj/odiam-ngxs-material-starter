import { Component, ChangeDetectionStrategy, EventEmitter, Output } from '@angular/core';

/**
 * Component used to display details about two factor authentication user settings.
 */
@Component({
	selector: 'odm-two-factor-authentication-details',
	templateUrl: './two-factor-authentication-details.component.html',
	styleUrls: ['./two-factor-authentication-details.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TwoFactorAuthenticationDetailsComponent {
	/**
	 * Event emitter when user requests to generate new recovery codes.
	 */
	@Output() generateNewRecoveryCodes = new EventEmitter<void>();
	constructor() {}

	/**
	 * Event handler when user requests to generate new recovery codes.
	 */
	onGenerateNewRecoveryCodes(): void {
		this.generateNewRecoveryCodes.emit();
	}
}
