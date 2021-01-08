import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AccountFacadeService } from '../account-facade.service';
import { Observable } from 'rxjs';
import { AccountSecurityDetails } from 'app/core/models/account-security-details.model';
import { LogService } from 'app/core/logger/log.service';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';

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

	/**
	 * Validation problem details$ of auth container component when form validations get passed angular but fail on the server.
	 */
	_problemDetails$: Observable<ProblemDetails>;

	/**
	 * Internal server error details$ of auth container component.
	 */
	_internalServerErrorDetails$: Observable<InternalServerErrorDetails>;

	/**
	 * Creates an instance of security container component.
	 * @param facade
	 */
	constructor(private facade: AccountFacadeService, private logger: LogService) {
		this._accountSecurityDetails$ = facade.accountSecurityDetails$;
		this._problemDetails$ = facade.problemDetails$;
		this._internalServerErrorDetails$ = facade.internalServerErrorDetails$;
	}

	/**
	 * NgOnInit life cycle.
	 */
	ngOnInit(): void {
		this.logger.trace('Initialized.', this);
		this.facade.getAccountSecurityInfo();
	}
}
