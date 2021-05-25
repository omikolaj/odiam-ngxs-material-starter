import { Injectable } from '@angular/core';
import { ProblemDetailsError } from 'app/core/error-handler/problem-details-error.decorator';
import { Observable } from 'rxjs';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerError } from 'app/core/error-handler/internal-server-error.decorator';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { Select, Store } from '@ngxs/store';
import { AccountGeneralState } from './general-container.store.state';
import { AccountGeneralDetails } from 'app/core/models/account/general/account-general-details.model';
import { AuthState } from 'app/core/auth/auth.store.state';
import { tap, switchMap } from 'rxjs/operators';
import * as General from './general-container.store.actions';
import { UsersAsyncService } from 'app/shared/services/users-async.service';

import { NotificationService } from 'app/core/core.module';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class GeneralSandboxService {
	/**
	 * Problem details error for account module.
	 */
	@ProblemDetailsError() problemDetails$: Observable<ProblemDetails>;
	/**
	 * Internal server error for account model.
	 */
	@InternalServerError() internalServerErrorDetails$: Observable<InternalServerErrorDetails>;

	/**
	 * Select users general details.
	 */
	@Select(AccountGeneralState.selectAccountGeneralDetails) accountGeneralDetails$: Observable<AccountGeneralDetails>;

	/**
	 * Creates an instance of general sandbox service.
	 * @param _store
	 * @param _userAsyncService
	 * @param _translationService
	 * @param _notificationService
	 */
	constructor(
		private _store: Store,
		private _userAsyncService: UsersAsyncService,
		private _translationService: TranslateService,
		private _notificationService: NotificationService
	) {}

	/**
	 * Gets user account general details.
	 */
	getAccountGeneralInfo(): void {
		const id = this._store.selectSnapshot(AuthState.selectCurrentUserId);
		this._userAsyncService
			.getAccountGeneralDetails$(id)
			.pipe(tap((accountGeneralDetails) => this._store.dispatch(new General.SetAccountGeneralDetails(accountGeneralDetails))))
			.subscribe();
	}

	/**
	 * Resends email verification.
	 */
	resendEmailVerification(): void {
		const id = this._store.selectSnapshot(AuthState.selectCurrentUserId);
		this._userAsyncService
			.resendEmailVerification$(id)
			.pipe(
				switchMap(() => this._translationService.get('odm.account.general.resend-verification-toast')),
				tap((message: string) => {
					this._notificationService.info(message);
				})
			)
			.subscribe();
	}
}
