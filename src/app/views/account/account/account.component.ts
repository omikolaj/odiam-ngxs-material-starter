import { Component, ChangeDetectionStrategy } from '@angular/core';

/**
 * User's account component. Houses all user specific settings.
 */
@Component({
	selector: 'odm-account',
	templateUrl: './account.component.html',
	styleUrls: ['./account.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountComponent {}
