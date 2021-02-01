import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
	selector: 'odm-sign-up',
	templateUrl: './sign-up.component.html',
	styleUrls: ['./sign-up.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignUpComponent implements OnInit {
	constructor() {}

	ngOnInit(): void {}
}
