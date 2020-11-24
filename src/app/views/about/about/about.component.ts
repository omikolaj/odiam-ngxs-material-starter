import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ROUTE_ANIMATIONS_ELEMENTS } from '../../../core/core.module';

/**
 * About component.
 */
@Component({
	selector: 'odm-about',
	templateUrl: './about.component.html',
	styleUrls: ['./about.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutComponent {
	routeAnimationsElements = ROUTE_ANIMATIONS_ELEMENTS;
}
