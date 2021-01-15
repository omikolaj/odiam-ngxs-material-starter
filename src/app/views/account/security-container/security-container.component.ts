import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AccountFacadeService } from '../account-facade.service';
import { Observable, Subscription, merge } from 'rxjs';
import { AccountSecurityDetails } from 'app/core/models/account-security-details.model';
import { LogService } from 'app/core/logger/log.service';
import { tap } from 'rxjs/internal/operators/tap';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { skip } from 'rxjs/operators';
import { ODM_SPINNER_DIAMETER, ODM_SPINNER_STROKE_WIDTH } from 'app/shared/mat-spinner-settings';

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

	_problemDetails$: Observable<ProblemDetails>;

	_internalServerError$: Observable<InternalServerErrorDetails>;

	_strokeWidth = ODM_SPINNER_STROKE_WIDTH;

	_diameter = ODM_SPINNER_DIAMETER;
	/**
	 * Creates an instance of security container component.
	 * @param facade
	 */
	constructor(private facade: AccountFacadeService, private logger: LogService) {
		this._accountSecurityDetails$ = facade.accountSecurityDetails$;
		this._problemDetails$ = facade.problemDetails$;
		this._internalServerError$ = facade.internalServerErrorDetails$;
	}

	/**
	 * NgOnInit life cycle.
	 */
	ngOnInit(): void {
		this.logger.trace('Initialized.', this);
		this.facade.getAccountSecurityInfo();
	}
}
