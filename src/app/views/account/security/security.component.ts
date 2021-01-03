import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { ROUTE_ANIMATIONS_ELEMENTS } from 'app/core/core.module';

@Component({
	selector: 'odm-security',
	templateUrl: './security.component.html',
	styleUrls: ['./security.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SecurityComponent implements OnInit {
	_show2Fa = false;
	_routeAnimationsElements = ROUTE_ANIMATIONS_ELEMENTS;
	@Input() twoFactorEnabled;

	constructor() {}

	ngOnInit(): void {}

	onTwoFactorAuthToggle(): void {
		this._show2Fa = !this._show2Fa;
	}
}
