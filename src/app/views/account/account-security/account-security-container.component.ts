import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ROUTE_ANIMATIONS_ELEMENTS } from 'app/core/core.module';
import { AccountFacadeService } from '../account-facade.service';
import { Observable } from 'rxjs';
import { AccountSecurityDetails } from 'app/core/models/account-security-details.model';

@Component({
	selector: 'odm-account-security-container',
	templateUrl: './account-security-container.component.html',
	styleUrls: ['./account-security-container.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountSecurityContainerComponent implements OnInit {
	_routeAnimationsElements = ROUTE_ANIMATIONS_ELEMENTS;
	_accountSecurityDetails$: Observable<AccountSecurityDetails>;

	constructor(private facade: AccountFacadeService) {
		this._accountSecurityDetails$ = facade.accountSecurityDetails$;
	}

	ngOnInit(): void {
		this.facade.getAccountSecurityInfo();
	}
}
