import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
	selector: 'odm-sign-in',
	templateUrl: './sign-in.component.html',
	styleUrls: ['./sign-in.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignInComponent implements OnInit {
	constructor() {}

	ngOnInit(): void {}
}
