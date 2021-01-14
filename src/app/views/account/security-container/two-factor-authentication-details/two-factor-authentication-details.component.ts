import { Component, ChangeDetectionStrategy, EventEmitter, Output, Input } from '@angular/core';
import { LogService } from 'app/core/logger/log.service';

/**
 * Two factor authentication details component.
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

	/**
	 * Recovery codes user has left to redeem for logging in.
	 */
	@Input() recoveryCodes: string[] = [];

	/**
	 * Whether or not there is an outgoing request to generate new recovery codes.
	 */
	@Input() generatingRecoveryCodes = false;

	/**
	 * Creates an instance of two factor authentication details component.
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
