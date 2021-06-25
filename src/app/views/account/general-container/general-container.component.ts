import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription, Observable, merge } from 'rxjs';
import { AccountGeneralDetails } from 'app/core/models/account/general/account-general-details.model';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { skip, filter, tap } from 'rxjs/operators';
import { implementsOdmWebApiException } from 'app/core/utilities/implements-odm-web-api-exception';
import { downUpFadeInAnimation, ROUTE_ANIMATIONS_ELEMENTS } from 'app/core/core.module';
import { LogService } from 'app/core/logger/log.service';
import { AccountSandboxService } from '../account-sandbox.service';
import { ODM_GLOBAL_ERROR_FONT_SIZE } from 'app/shared/global-settings/global-settings';
import { ODM_FALLBACK_EMAIL_ADDRESS } from 'app/shared/global-settings/fallback-email-address';

/**
 * General component container that houses user's general settings functionality.
 */
@Component({
	selector: 'odm-general-container',
	templateUrl: './general-container.component.html',
	styleUrls: ['./general-container.component.scss'],
	animations: [downUpFadeInAnimation],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeneralContainerComponent implements OnInit, OnDestroy {
	/**
	 * Route animations.
	 */
	readonly _routeAnimationsElements = ROUTE_ANIMATIONS_ELEMENTS;

	/**
	 * Error font size for server errors.
	 */
	readonly _errorFontSize = ODM_GLOBAL_ERROR_FONT_SIZE;

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
	 * Controls whether 'resend notification' button is disabled/enabled.
	 */
	_disableResendVerificationSub = new BehaviorSubject(false);

	/**
	 * Whether 'resend notification' button is disabled/enabled.
	 */
	_disableResendVerification$ = this._disableResendVerificationSub.asObservable();

	/**
	 * Fallback email address if one cannot be fetched from the server.
	 */
	_fallbackEmail = ODM_FALLBACK_EMAIL_ADDRESS;

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
	 * @param _sb
	 */
	constructor(private _sb: AccountSandboxService, private _log: LogService) {
		this._accountGeneralDetails$ = _sb.accountGeneralDetails$;
		this._internalServerErrorDetails$ = _sb.internalServerErrorDetails$;
		this._problemDetails$ = _sb.problemDetails$;
	}

	/**
	 * NgOnInit life cycle.
	 */
	ngOnInit(): void {
		this._log.trace('Initialized.', this);

		this._loadingSub.next(true);
		this._sb.getAccountGeneralInfo();

		this._subscription.add(
			merge(
				// skip first value that emits, which is the default value.
				this._accountGeneralDetails$.pipe(skip(1)),
				this._problemDetails$,
				this._internalServerErrorDetails$
			)
				.pipe(
					filter((value) => value !== undefined),
					tap(() => {
						this._sb.log.debug('Emitting `false` for loading.', this);
						this._loadingSub.next(false);
					})
				)
				.subscribe()
		);
	}

	/**
	 * NgOnDestroy life cycle.
	 */
	ngOnDestroy(): void {
		this._log.trace('Destroyed.', this);
		this._subscription.unsubscribe();
	}

	/**
	 * Event handler when user requests to have email verification re-sent.
	 */
	_onResendEmailVerificationClicked(): void {
		this._sb.resendEmailVerification();
		this._disableResendVerificationSub.next(true);
		setTimeout(() => {
			this._disableResendVerificationSub.next(false);
		}, 60_000);
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
