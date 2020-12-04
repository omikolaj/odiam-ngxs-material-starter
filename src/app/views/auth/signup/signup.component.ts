import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
	selector: 'odm-signup',
	templateUrl: './signup.component.html',
	styleUrls: ['./signup.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignupComponent implements OnInit {
	constructor() {}

	ngOnInit(): void {}
}
