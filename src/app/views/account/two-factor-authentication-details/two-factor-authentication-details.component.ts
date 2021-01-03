import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { TooltipTouchGestures } from '@angular/material/tooltip';

@Component({
	selector: 'odm-two-factor-authentication-details',
	templateUrl: './two-factor-authentication-details.component.html',
	styleUrls: ['./two-factor-authentication-details.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TwoFactorAuthenticationDetailsComponent implements OnInit {
	_touchGestrues: TooltipTouchGestures = 'on';
	constructor() {}

	ngOnInit(): void {}
}
