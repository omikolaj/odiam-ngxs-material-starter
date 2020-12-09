import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

/**
 * AuthContainer component
 */
@Component({
	selector: 'odm-auth-container',
	templateUrl: './auth-container.component.html',
	styleUrls: ['./auth-container.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthContainerComponent implements OnInit {
	constructor() {}

	/**
	 * NgOnInit life cycle.
	 */
	ngOnInit(): void {}
}
