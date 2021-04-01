import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { AccountFacadeService } from '../account-facade.service';
import { BehaviorSubject, Subscription, Observable, merge } from 'rxjs';
import { AccountGeneralDetails } from 'app/core/models/account-general-details.model';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { skip, filter, tap } from 'rxjs/operators';
import { implementsOdmWebApiException } from 'app/core/utilities/implements-odm-web-api-exception';
import { fadeInAnimation, upDownFadeInAnimation } from 'app/core/core.module';

/**
 * General component container that houses user's general settings functionality.
 */
@Component({
	selector: 'odm-general-container',
	templateUrl: './general-container.component.html',
	styleUrls: ['./general-container.component.scss'],
	animations: [fadeInAnimation, upDownFadeInAnimation],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeneralContainerComponent implements OnInit, OnDestroy {
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
	private readonly _loadingSub = new BehaviorSubject<boolean>(true);

	/**
	 * Whether this component is fetching data for the view.
	 */
	_loading$ = this._loadingSub.asObservable();

	/**
	 * Rxjs subscriptions for this component.
	 */
	private readonly _subscription = new Subscription();

	/**
	 * Creates an instance of general container component.
	 * @param facade
	 */
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
				this._accountGeneralDetails$.pipe(skip(1)),
				this._problemDetails$,
				this._internalServerErrorDetails$
			)
				.pipe(
					filter((value) => value !== undefined),
					tap(() => this._loadingSub.next(false))
				)
				.subscribe()
		);
	}

	/**
	 * NgOnDestroy life cycle.
	 */
	ngOnDestroy(): void {
		this.facade.log.trace('Destroyed.', this);
		this._subscription.unsubscribe();
	}

	/**
	 * Event handler when user requests to have email verification re-sent.
	 */
	_onResendEmailVerificationClicked(): void {
		this.facade.resendEmailVerification();
	}

	/**
	 * Gets problem details error message.
	 * @returns problem details error message
	 */
	_getProblemDetailsErrorMessage(problemDetails: ProblemDetails): string {
		return problemDetails.detail;
	}

	/**
	 * Gets internal server error message.
	 * @returns internal server error message
	 */
	_getInternalServerErrorMessage(internalServerErrorDetails: InternalServerErrorDetails): string {
		let errorDescription = '';
		if (this._doesInternalServerErrorImplementOdmWebApiException(internalServerErrorDetails)) {
			errorDescription = internalServerErrorDetails.detail;
		} else {
			errorDescription = internalServerErrorDetails.message;
		}
		return errorDescription;
	}

	/**
	 * Checks if internal server error implements OdmWebAPiException.
	 */
	private _doesInternalServerErrorImplementOdmWebApiException(internalServerErrorDetails: InternalServerErrorDetails): boolean {
		return implementsOdmWebApiException(internalServerErrorDetails);
	}
}
