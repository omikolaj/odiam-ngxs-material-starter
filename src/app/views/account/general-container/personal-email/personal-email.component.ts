import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { LogService } from 'app/core/logger/log.service';

/**
 * User's personal email component.
 */
@Component({
	selector: 'odm-personal-email',
	templateUrl: './personal-email.component.html',
	styleUrls: ['./personal-email.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PersonalEmailComponent {
	/**
	 * Personal email registered with user's account.
	 */
	@Input() email = '';

	/**
	 * Whether user's email is verified.
	 */
	@Input() verified: boolean;

	/**
	 * Whether the general data is being fetched.
	 */
	@Input() loading: boolean;

	/**
	 * Event emitter when user requests to re-send email verification.
	 */
	@Output() resendEmailVerificationClicked = new EventEmitter<void>();

	/**
	 * Creates an instance of personal email component.
	 * @param _log
	 */
	constructor(private _log: LogService) {}

	/**
	 * Event handler that resends user's email verification link.
	 */
	_onResendEmailVerificationClicked(): void {
		this._log.trace('_onResendEmailVerificationClicked fired.', this);
		this.resendEmailVerificationClicked.emit();
	}
}
