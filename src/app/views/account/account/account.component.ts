import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AccountFacadeService } from '../account-facade.service';
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

	constructor(private facade: AccountFacadeService) {
		this.accountDetails$ = facade.accountDetails$;
	}

	ngOnInit(): void {
		this.facade.getUserProfile();
	}
}
