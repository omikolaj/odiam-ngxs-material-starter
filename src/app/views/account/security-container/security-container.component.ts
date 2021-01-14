import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AccountFacadeService } from '../account-facade.service';
import { Observable } from 'rxjs';
import { AccountSecurityDetails } from 'app/core/models/account-security-details.model';
import { LogService } from 'app/core/logger/log.service';
import { ofActionSuccessful } from '@ngxs/store';
import { tap } from 'rxjs/internal/operators/tap';

/**
 * Component container that houses user security functionality.
 */
@Component({
	selector: 'odm-security-container',
	templateUrl: './security-container.component.html',
	styleUrls: ['./security-container.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SecurityContainerComponent implements OnInit {
	/**
	 * Account security details for the given user.
	 */
	_accountSecurityDetails$: Observable<AccountSecurityDetails>;

	generatingNewRecoveryCodes = false;

	/**
	 * Creates an instance of security container component.
	 * @param facade
	 */
	constructor(private facade: AccountFacadeService, private logger: LogService) {
		this._accountSecurityDetails$ = facade.accountSecurityDetails$;
	}

	/**
	 * NgOnInit life cycle.
	 */
	ngOnInit(): void {
		this.logger.trace('Initialized.', this);
		this.facade.getAccountSecurityInfo();
	}
}
