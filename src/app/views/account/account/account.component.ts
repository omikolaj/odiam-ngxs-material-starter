import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AccountDetails } from 'app/core/models/account-details.model';
import { Observable } from 'rxjs';

@Component({
	selector: 'odm-account',
	templateUrl: './account.component.html',
	styleUrls: ['./account.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountComponent implements OnInit {
	accountDetails$: Observable<AccountDetails>;

	constructor() {}

	ngOnInit(): void {}
}
