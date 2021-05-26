import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { Observable, Subscription, merge, BehaviorSubject } from 'rxjs';
import { AccountSecurityDetails } from 'app/core/models/account/security/account-security-details.model';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { skip, filter, tap } from 'rxjs/operators';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ROUTE_ANIMATIONS_ELEMENTS, routeAnimations } from 'app/core/core.module';
import { ActionCompletion } from '@ngxs/store';

import { SecuritySandboxService } from './security-sandbox.service';
import { TwoFactorAuthenticationSetup } from 'app/core/models/account/security/two-factor-authentication-setup.model';

/**
 * Security component container that houses user security functionality.
 */
@Component({
	selector: 'odm-security-container',
	templateUrl: './security-container.component.html',
	styleUrls: ['./security-container.component.scss'],
	animations: [routeAnimations],
	changeDetection: ChangeDetectionStrategy.Default
})
export class SecurityContainerComponent implements OnInit {
	/**
	 * Route animations.
	 */
	readonly _routeAnimationsElements = ROUTE_ANIMATIONS_ELEMENTS;

	/**
	 * Account security details for the given user.
	 */
	_accountSecurityDetails$: Observable<AccountSecurityDetails>;

	/**
	 * Emitted when server responds with 40X error.
	 */
	_problemDetails$: Observable<ProblemDetails>;

	/**
	 * Emitted when server responds with 50X error.
	 */
	_internalServerErrorDetails$: Observable<InternalServerErrorDetails>;

	/**
	 * Two factor authenticator setup.
	 */
	_authenticatorSetup$: Observable<TwoFactorAuthenticationSetup>;

	/**
	 * Whether there is an outgoing request to generate new recovery codes.
	 */
	_generatingNewRecoveryCodes: boolean;

	/**
	 * Loading subject. Required for angular OnPush change detection to be triggered.
	 */
	private readonly _loadingSub = new BehaviorSubject<boolean>(false);

	/**
	 * Whether this component is fetching data for view.
	 */
	_loading$ = this._loadingSub.asObservable();

	/**
	 * Loading subject. Required for angular OnPush change detection to be triggered.
	 */
	private _twoFactorAuthToggleLoadingSub = new BehaviorSubject<boolean>(false);

	/**
	 * Whether there is an outgoing request to enable/disable two factor authentication setting.
	 */
	_twoFactorAuthToggleLoading$ = this._twoFactorAuthToggleLoadingSub.asObservable();

	/**
	 * Rxjs subscriptions for this component.
	 */
	private readonly _subscription = new Subscription();

	/**
	 * Creates an instance of security container component.
	 * @param _sb
	 */
	constructor(private _sb: SecuritySandboxService) {
		this._accountSecurityDetails$ = _sb.accountSecurityDetails$;
		// required to listen for TwoFactorAuthenticationSetup when it emits
		this._authenticatorSetup$ = _sb.twoFactorAuthenticationSetup$;
		this._problemDetails$ = _sb.problemDetails$;
		this._internalServerErrorDetails$ = _sb.internalServerErrorDetails$;
	}

	/**
	 * NgOnInit life cycle. Emits loading value then fetches data for this component
	 */
	ngOnInit(): void {
		this._sb.log.trace('Initialized.', this);
		// initializes loading for fetching account security info.
		this._loadingSub.next(true);
		// fetches account security info.
		this._sb.getAccountSecurityInfo();
		// subscribes to security container component. Used to handle loading flags.
		this._subscription.add(this._listenToSecurityEvents$().subscribe());
	}

	/**
	 * Event handler when user requests to enable/disable two factor authentication.
	 * @param event
	 */
	_onTwoFactorAuthToggle(event: MatSlideToggleChange): void {
		this._sb.log.trace('_onTwoFactorAuthToggle fired.', this);
		this._twoFactorAuthToggleLoadingSub.next(true);

		if (event.checked) {
			this._sb.log.debug('_onTwoFactorAuthToggle: enter 2fa setup.', this);
			this._sb.setupAuthenticator();
		} else {
			this._sb.log.debug('_onTwoFactorAuthToggle: disable 2fa.', this);
			this._sb.disable2Fa();
		}
	}

	/**
	 * Event handler when user requests to generate new recovery codes.
	 */
	_onGenerateNew2faRecoveryCodesClicked(): void {
		this._sb.log.trace('_onGenerateNew2FaRecoveryCodes fired.', this);
		this._generatingNewRecoveryCodes = true;
		this._sb.generateRecoveryCodes();
	}

	/**
	 * Listens to security events.
	 * @returns to security events
	 */
	private _listenToSecurityEvents$(): Observable<
		AccountSecurityDetails | ActionCompletion<any, Error> | ProblemDetails | InternalServerErrorDetails | TwoFactorAuthenticationSetup
	> {
		this._sb.log.trace('_listenToSecurityEvents executed.', this);
		return merge(
			// skip first value that emits, which is the default value.
			this._accountSecurityDetails$.pipe(skip(1)),
			this._sb.onCompletedUpdateRecoveryCodesAction$,
			// skip first value that emits, which is the default value.
			this._authenticatorSetup$.pipe(skip(1)),
			// if problem details is emitted make sure to stop loading state.
			this._problemDetails$,
			// if internal server error details is emitted make sure to stop loading state.
			this._internalServerErrorDetails$
		).pipe(
			filter((value) => value !== undefined),
			// set the _verfyingCode property to false if any of the above observables emit
			tap(() => {
				// manual subject is NOT necessary because when _generatingNewRecoveryCodes changes to false, onCompletedUpdateRecoveryCodesAction$ emits.
				this._generatingNewRecoveryCodes = false;
				// manual subject is necessary because when twoFactoAuthToggle changes nothing else emits so OnPush change detection is not triggered.
				this._twoFactorAuthToggleLoadingSub.next(false);
				// manual subject is necessary because when loading changes nothing else emits so OnPush change detection is not triggered.
				this._loadingSub.next(false);
			})
		);
	}
}
