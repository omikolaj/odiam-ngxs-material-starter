import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
	selector: 'odm-signin',
	templateUrl: './signin.component.html',
	styleUrls: ['./signin.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SigninComponent implements OnInit {
	constructor() {}

	ngOnInit(): void {}
}
