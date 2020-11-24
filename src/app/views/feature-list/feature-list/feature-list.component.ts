import { Component, ChangeDetectionStrategy } from '@angular/core';

import { ROUTE_ANIMATIONS_ELEMENTS } from '../../../core/core.module';

import { Feature, features } from '../feature-list.data';

/**
 * Feature list component.
 */
@Component({
	selector: 'odm-feature-list',
	templateUrl: './feature-list.component.html',
	styleUrls: ['./feature-list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeatureListComponent {
	routeAnimationsElements = ROUTE_ANIMATIONS_ELEMENTS;
	features: Feature[] = features;

	/**
	 * Opens link in a new tab.
	 * @param link
	 */
	openLink(link: string): void {
		window.open(link, '_blank');
	}
}
