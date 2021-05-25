import { Component, ChangeDetectionStrategy } from '@angular/core';
import { routeAnimations } from 'app/core/core.module';

/**
 * User's account component. Houses all user specific settings.
 */
@Component({
	selector: 'odm-account',
	templateUrl: './account.component.html',
	styleUrls: ['./account.component.scss'],
	animations: [routeAnimations],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountComponent {}
