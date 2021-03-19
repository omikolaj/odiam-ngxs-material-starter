import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { AccountFacadeService } from '../account-facade.service';
import { Observable, Subscription, merge, BehaviorSubject } from 'rxjs';
import { AccountSecurityDetails } from 'app/core/models/account-security-details.model';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { skip, filter, tap } from 'rxjs/operators';
import { TwoFactorAuthenticationSetupResult } from './two-factor-authentication/models/two-factor-authentication-setup-result.model';
import { TwoFactorAuthenticationSetup } from './two-factor-authentication/models/two-factor-authentication-setup.model';
import { FormGroup } from '@angular/forms';
import { OdmValidators } from 'app/core/form-validators/odm-validators';
import { TwoFactorAuthenticationVerificationCode } from './two-factor-authentication/models/two-factor-authentication-verification-code.model';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

import { upDownFadeInAnimation } from 'app/core/core.module';
import { ActionCompletion } from '@ngxs/store';

/**
 * Component container that houses user security functionality.
 */
@Component({
	selector: 'odm-security-container',
	templateUrl: './security-container.component.html',
	styleUrls: ['./security-container.component.scss'],
	animations: [upDownFadeInAnimation],
	changeDetection: ChangeDetectionStrategy.Default
})
export class SecurityContainerComponent implements OnInit {
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
	 * Authenticator setup result model.
	 */
	_authenticatorSetupResult$: Observable<TwoFactorAuthenticationSetupResult>;

	/**
	 * Two factor authenticator setup.
	 */
	_authenticatorSetup$: Observable<TwoFactorAuthenticationSetup>;

	/**
	 * Verification code form for two factor authentication setup.
	 */
	_verificationCodeForm: FormGroup;

	/**
	 * Whether we are in the middle of a request to verify two factor authentication setup verification code.
	 */
	_codeVerificationInProgress: boolean;

	/**
	 * Whether there is an outgoing request to generate new recovery codes.
	 */
	_generatingNewRecoveryCodes: boolean;

	/**
	 * Whether there is an outgoing request to enable/disable two factor authentication.
	 */
	_twoFactorAuthToggleLoading: boolean;

	/**
	 * Whether to show two factor authentication setup wizard.
	 */
	_showTwoFactorAuthSetupWizard = false;

	/**
	 * Whether or not server error was handled and displayed by two-factor-authentication-setup component.
	 */
	_serverErrorHandled = false;

	/**
	 * Loading subject. Required for angular OnPush change detection to be triggered.
	 */
	private _loadingSub = new BehaviorSubject<boolean>(false);

	/**
	 * Whether this component is fetching data for the view.
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
	 * Emitted when server responds with 40X or 50X error.
	 */
	_serverError$: Observable<ProblemDetails | InternalServerErrorDetails>;

	/**
	 * Whether this component should display server side error.
	 */
	_showServerError: boolean;

	/**
	 * Rxjs subscriptions for this component.
	 */
	private _subscription = new Subscription();

	/**
	 * Creates an instance of security container component.
	 * @param facade
	 */
	constructor(private facade: AccountFacadeService, private cd: ChangeDetectorRef) {
		this._accountSecurityDetails$ = facade.accountSecurityDetails$;
		this._authenticatorSetup$ = facade.twoFactorAuthenticationSetup$;
		this._authenticatorSetupResult$ = facade.twoFactorAuthenticationSetupResult$;
		this._problemDetails$ = facade.problemDetails$.pipe(
			// if we're NOT displaying two factor auth setup wizard show error if occured

			tap(() => {
				if (this._showTwoFactorAuthSetupWizard === false) {
					this._showServerError = true;
				}
			})
		);
		this._internalServerErrorDetails$ = facade.internalServerErrorDetails$.pipe(
			// if we're NOT displaying two factor auth setup wizard show error if occured
			tap(() => {
				if (this._showTwoFactorAuthSetupWizard === false) {
					this._showServerError = true;
				}
			})
		);
	}

	/**
	 * NgOnInit life cycle. Emits loading value then fetches data for this component
	 */
	ngOnInit(): void {
		this.facade.log.trace('Initialized.', this);

		this._loadingSub.next(true);
		this.facade.getAccountSecurityInfo();

		this._subscription.add(this._listenToSecurityEvents().subscribe());

		// this._subscription.add(
		// 	merge(
		// 		// skip first value that emits, which is the default value.
		// 		this._accountSecurityDetails$.pipe(skip(1)),
		// 		// skip first value that emits, which is the default value.
		// 		this._authenticatorSetupResult$.pipe(skip(1)),
		// 		this.facade.onCompletedUpdateRecoveryCodesAction$,
		// 		// skip first value that emits, which is the default value.
		// 		this._authenticatorSetup$.pipe(skip(1)),
		// 		// if problem details is emitted make sure to stop loading state.
		// 		this._problemDetails$,
		// 		// if internal server error details is emitted make sure to stop loading state.
		// 		this._internalServerErrorDetails$
		// 	)
		// 		.pipe(
		// 			filter((value) => value !== undefined),
		// 			// set the _verfyingCode property to false if any of the above observables emit
		// 			tap(() => {
		// 				// manual subject is NOT necessary because when codeVerificationInProgress changes to false, twoFactorAuthenticationSetupResult$ emits.
		// 				this._codeVerificationInProgress = false;
		// 				// manual subject is NOT necessary because when _generatingNewRecoveryCodes changes to false, onCompletedUpdateRecoveryCodesAction$ emits.
		// 				this._generatingNewRecoveryCodes = false;
		// 				// manual subject is necessary because when twoFactoAuthToggle changes nothing else emits so OnPush change detection is not triggered.
		// 				this._twoFactorAuthToggleLoadingSub.next(false);
		// 				// manual subject is necessary because when loading changes nothing else emits so OnPush change detection is not triggered.
		// 				this._loadingSub.next(false);
		// 			})
		// 		)
		// 		.subscribe()
		// );

		// this._serverError$ = merge(this._problemDetails$, this._internalServerErrorDetails$);

		this._initVerificationCodeForm();
	}

	private _listenToSecurityEvents(): Observable<
		| AccountSecurityDetails
		| TwoFactorAuthenticationSetupResult
		| ActionCompletion<any, Error>
		| TwoFactorAuthenticationSetup
		| ProblemDetails
		| InternalServerErrorDetails
	> {
		return merge(
			// skip first value that emits, which is the default value.
			this._accountSecurityDetails$.pipe(skip(1)),
			// skip first value that emits, which is the default value.
			this._authenticatorSetupResult$.pipe(skip(1)),
			this.facade.onCompletedUpdateRecoveryCodesAction$,
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
				// manual subject is NOT necessary because when codeVerificationInProgress changes to false, twoFactorAuthenticationSetupResult$ emits.
				this._codeVerificationInProgress = false;
				// manual subject is NOT necessary because when _generatingNewRecoveryCodes changes to false, onCompletedUpdateRecoveryCodesAction$ emits.
				this._generatingNewRecoveryCodes = false;
				// manual subject is necessary because when twoFactoAuthToggle changes nothing else emits so OnPush change detection is not triggered.
				this._twoFactorAuthToggleLoadingSub.next(false);
				// manual subject is necessary because when loading changes nothing else emits so OnPush change detection is not triggered.
				this._loadingSub.next(false);
			})
		);
	}

	/**
	 * Event handler when user requests to enable/disable two factor authentication.
	 * @param event
	 */
	_onTwoFactorAuthToggle(event: MatSlideToggleChange): void {
		this.facade.log.trace('_onTwoFactorAuthToggle fired.', this);
		this._twoFactorAuthToggleLoadingSub.next(true);

		if (event.checked) {
			this.facade.log.trace('_onTwoFactorAuthToggle: enter 2fa setup.', this);
			this.facade.setupAuthenticator();
		} else {
			this.facade.log.trace('_onTwoFactorAuthToggle: disable 2fa.', this);
			this.facade.disable2Fa();
		}
	}

	/**
	 * Event handler when two factor authentication setup wizard is displayed.
	 */
	_onServerErrorHandled(): void {
		// when two factor authentication setup wizard is displayed, hide the error in security-container component.
		this._showServerError = false;
		this._showTwoFactorAuthSetupWizard = true;
	}

	/**
	 * Event handler when user requests to verify authenticator code.
	 * @param event
	 */
	_verifyAuthenticatorClicked(event: TwoFactorAuthenticationVerificationCode): void {
		this.facade.log.trace('_onVerifyAuthenticator fired.', this);
		this._codeVerificationInProgress = true;
		this.facade.verifyAuthenticator(event);
	}

	/**
	 * Event handler when user cancels the two factor authentication setup wizard.
	 */
	_cancelSetupWizardClicked(): void {
		this.facade.log.trace('_onCancelSetupWizard fired.', this);
		this._showTwoFactorAuthSetupWizard = false;
		this._showServerError = false;
		this._verificationCodeForm.reset();
		this.facade.cancel2faSetupWizard();
	}

	/**
	 * Event handler when user finishes two factor authentication setup.
	 */
	_finish2faSetupClicked(event: TwoFactorAuthenticationSetupResult): void {
		this.facade.log.trace('_onFinish2faSetup fired.', this);
		this._showTwoFactorAuthSetupWizard = false;
		this._showServerError = false;
		this._verificationCodeForm.reset();
		this.facade.finish2faSetup(event);
	}

	/**
	 * Event handler when user requests to generate new recovery codes.
	 */
	_generateNew2faRecoveryCodesClicked(): void {
		this.facade.log.trace('_onGenerateNew2FaRecoveryCodes fired.', this);
		this._generatingNewRecoveryCodes = true;
		this.facade.generateRecoveryCodes();
	}

	/**
	 * Event handler that is set when server error has been already displayed to the user in two-factor-authentication-setup-wizard.
	 * @param hanlded
	 */
	_onServerErrorHandledEmitted(handled: boolean): void {
		this.facade.log.trace('_onServerErrorHandledEmitted fired.', this, handled);
		// this._serverErrorHandled = true;
		this._showServerError = false;
	}

	/**
	 * Initializes verification code form.
	 */
	private _initVerificationCodeForm(): void {
		this._verificationCodeForm = this.facade.fb.group({
			verificationCode: this.facade.fb.control(
				{ value: '', disabled: true },
				{
					validators: [OdmValidators.required, OdmValidators.minLength(6), OdmValidators.maxLength(6)],
					updateOn: 'change'
				}
			)
		});
	}
}
