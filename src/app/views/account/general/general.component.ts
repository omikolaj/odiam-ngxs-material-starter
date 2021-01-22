import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
	selector: 'odm-general',
	templateUrl: './general.component.html',
	styleUrls: ['./general.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeneralComponent implements OnInit {
	constructor() {}

	/**
	 * NgOnInit life cycle.
	 */
	ngOnInit(): void {}
}
