import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AccountFacadeService } from '../account-facade.service';
import { BehaviorSubject, Subscription, Observable, merge } from 'rxjs';
import { AccountGeneralDetails } from 'app/core/models/account-general-details.model';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { skip, filter, finalize } from 'rxjs/operators';

@Component({
	selector: 'odm-general-container',
	templateUrl: './general-container.component.html',
	styleUrls: ['./general-container.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeneralContainerComponent implements OnInit {
	/**
	 * Account general details for the given user.
	 */
	_accountGeneralDetails$: Observable<AccountGeneralDetails>;

	/**
	 * Emitted when server responds with 40X error.
	 */
	_problemDetails$: Observable<ProblemDetails>;

	/**
	 * Emitted when server responds with 50X error.
	 */
	_internalServerErrorDetails$: Observable<InternalServerErrorDetails>;

	/**
	 * Loading subject. Required for angular OnPush change detection to be triggered.
	 */
	private _loadingSub = new BehaviorSubject<boolean>(false);

	/**
	 * Whether this component is fetching data for the view.
	 */
	_loading$ = this._loadingSub.asObservable();

	/**
	 * Rxjs subscriptions for this component.
	 */
	private _subscription = new Subscription();

	constructor(private facade: AccountFacadeService) {
		this._accountGeneralDetails$ = facade.accountGeneralDetails$;
		this._internalServerErrorDetails$ = facade.internalServerErrorDetails$;
		this._problemDetails$ = facade.problemDetails$;
	}

	/**
	 * NgOnInit life cycle.
	 */
	ngOnInit(): void {
		this.facade.log.trace('Initialized.', this);

		this._loadingSub.next(true);
		this.facade.getAccountGeneralInfo();

		this._subscription.add(
			merge(
				// skip first value that emits, which is the default value.
				this.facade.accountGeneralDetails$.pipe(skip(1)),
				this.facade.problemDetails$,
				this.facade.accountSecurityDetails$
			)
				.pipe(
					filter((value) => value !== undefined),
					finalize(() => {
						this._loadingSub.next(false);
					})
				)
				.subscribe()
		);
	}

	/**
	 * Event handler when user requests to have email verification re-sent.
	 */
	_onResendEmailVerificationClicked(): void {
		this.facade.resendEmailVerification();
	}
}
