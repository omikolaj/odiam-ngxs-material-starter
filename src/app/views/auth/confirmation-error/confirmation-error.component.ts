import { Component, ChangeDetectionStrategy } from '@angular/core';

/**
 * Component that is displayed when there is an issue with confirmations. (Email confirmation, change email confirmation etc.)
 */
@Component({
	selector: 'odm-email-confirmation-error',
	templateUrl: './confirmation-error.component.html',
	styleUrls: ['./confirmation-error.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmationErrorComponent {}
