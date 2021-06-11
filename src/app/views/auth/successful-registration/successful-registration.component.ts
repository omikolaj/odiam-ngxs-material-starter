import { Component, ChangeDetectionStrategy } from '@angular/core';

/**
 * Component displayed when user successfully registers
 */
@Component({
	selector: 'odm-successful-registration',
	templateUrl: './successful-registration.component.html',
	styleUrls: ['./successful-registration.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuccessfulRegistrationComponent {}
