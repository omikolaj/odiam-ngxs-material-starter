import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
	selector: 'odm-auth-dialog',
	templateUrl: './auth-dialog.component.html',
	styleUrls: ['./auth-dialog.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthDialogComponent implements OnInit {
	constructor() {}

	ngOnInit(): void {}
}
