import { Component, ChangeDetectionStrategy, ViewChild, AfterViewInit } from '@angular/core';
import { MatTabGroup } from '@angular/material/tabs';
import { Router, ActivatedRoute } from '@angular/router';

/**
 * User's account component. Houses all user specific settings.
 */
@Component({
	selector: 'odm-account',
	templateUrl: './account.component.html',
	styleUrls: ['./account.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountComponent implements AfterViewInit {
	/**
	 *
	 */
	constructor(private _router: Router, private _route: ActivatedRoute) {}

	@ViewChild('tabGroup') tabGroup: MatTabGroup;

	ngAfterViewInit(): void {
		// this.tabGroup.selectedTabChange.subscribe((event: MatTabChangeEvent) => {
		// 	console.log('selected tab value', event);
		// 	switch (event.index) {
		// 		case 0:
		// 			void this._router.navigate(['general'], { relativeTo: this._route.parent });
		// 			break;
		// 		case 1:
		// 			void this._router.navigate(['security'], { relativeTo: this._route.parent });
		// 			break;
		// 		default:
		// 			break;
		// 	}
		// });
	}
}
