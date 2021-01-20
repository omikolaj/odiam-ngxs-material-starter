import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AccountFacadeService } from '../account-facade.service';
import { Observable, Subscription, merge, Subject, BehaviorSubject } from 'rxjs';
import { AccountSecurityDetails } from 'app/core/models/account-security-details.model';
import { LogService } from 'app/core/logger/log.service';
import { tap } from 'rxjs/internal/operators/tap';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { skip, filter } from 'rxjs/operators';
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
	 * Security container needs to manually emit loading values because when its loading two-factor-authentication component
	 * it is not binding any observables in the template so changing the loading value does not trigger change detection
	 */
	private _loadingSub = new BehaviorSubject<boolean>(false);

	_loading$ = this._loadingSub.asObservable();

	private _subscription = new Subscription();
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
		this._loadingSub.next(true);
		this.facade.getAccountSecurityInfo();

		this._subscription.add(
			merge(this.facade.accountSecurityDetails$.pipe(skip(1)), this.facade.problemDetails$, this.facade.internalServerErrorDetails$)
				.pipe(
					filter((value) => value !== undefined),
					tap(() => this._loadingSub.next(false))
				)
				.subscribe()
		);
	}
}
