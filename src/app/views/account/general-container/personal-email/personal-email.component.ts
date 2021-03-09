import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';

/**
 * User's personal email component.
 */
@Component({
	selector: 'odm-personal-email',
	templateUrl: './personal-email.component.html',
	styleUrls: ['./personal-email.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PersonalEmailComponent implements OnInit {
	/**
	 * Personal email registered with user's account.
	 */
	@Input() email = '';

	/**
	 * Whether user's email is verified.
	 */
	@Input() verified = false;

	/**
	 * Event emitter when user requests to re-send email verification.
	 */
	@Output() resendEmailVerificationClicked = new EventEmitter<void>();

	constructor() {}

	ngOnInit(): void {}

	/**
	 * Event handler that resends user's email verification link.
	 */
	_onResendEmailVerificationClicked(): void {
		this.resendEmailVerificationClicked.emit();
	}
}
