import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AccountSandboxService } from '../account-sandbox.service';
import { Observable, Subscription, merge, BehaviorSubject } from 'rxjs';
import { AccountSecurityDetails } from 'app/core/models/account/security/account-security-details.model';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { skip, filter, tap } from 'rxjs/operators';
import { FormGroup } from '@angular/forms';
import { OdmValidators, VerificationCodeLength, MinPasswordLength } from 'app/core/form-validators/odm-validators';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { upDownFadeInAnimation } from 'app/core/core.module';
import { ActionCompletion } from '@ngxs/store';
import { TwoFactorAuthenticationSetupResult } from 'app/core/models/account/security/two-factor-authentication-setup-result.model';
import { TwoFactorAuthenticationSetup } from 'app/core/models/account/security/two-factor-authentication-setup.model';
import { TwoFactorAuthenticationVerificationCode } from 'app/core/models/account/security/two-factor-authentication-verification-code.model';
import { PasswordChange } from 'app/core/models/auth/password-change.model';

/**
 * Security component container that houses user security functionality.
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
	 * Change password form.
	 */
	_changePasswordForm: FormGroup;

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
	 * Emitted when server responds with 40X or 50X error.
	 */
	_serverError$: Observable<ProblemDetails | InternalServerErrorDetails>;

	/**
	 * Whether password change has completed without errors.
	 */
	_passwordChangeCompleted$: Observable<boolean>;

	/**
	 * Whether this component should display server side error.
	 */
	_showServerError: boolean;

	/**
	 * Requires user to enter the same password for confirm password field.
	 */
	_confirmPasswordMatchReqMet = false;

	/**
	 * Loading subject. Required for angular OnPush change detection to be triggered.
	 */
	private readonly _loadingSub = new BehaviorSubject<boolean>(false);

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
	 * Whether change password view is open.
	 */
	private _changePasswordOpened = false;

	/**
	 * Whether user recovery codes pnael is open.
	 */
	private _userRecoveryCodesPanelOpened = false;

	/**
	 * Rxjs subscriptions for this component.
	 */
	private readonly _subscription = new Subscription();

	/**
	 * Creates an instance of security container component.
	 * @param _sb
	 */
	constructor(private _sb: AccountSandboxService) {
		this._accountSecurityDetails$ = _sb.accountSecurityDetails$;
		this._authenticatorSetup$ = _sb.twoFactorAuthenticationSetup$;
		this._authenticatorSetupResult$ = _sb.twoFactorAuthenticationSetupResult$;
		this._problemDetails$ = _sb.problemDetails$;
		this._internalServerErrorDetails$ = _sb.internalServerErrorDetails$;
		this._passwordChangeCompleted$ = _sb.passwordChangeCompleted$;
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
		// serverError used for components that display server side errors without adding them to AbstractControl.
		this._serverError$ = merge(this._problemDetails$, this._internalServerErrorDetails$).pipe(tap(() => this.shouldDisplayError()));
		// initializes forms for Security container component.
		this._initForms();
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
	 * Event handler when two factor authentication setup wizard is displayed.
	 */
	_onServerErrorHandled(event: boolean): void {
		// when two factor authentication setup wizard is displayed, hide the error in security-container component.
		this._sb.log.trace('_onServerErrorHandled fired.', this);
		// if server error was handled, do not show error
		this._showServerError = !event;
	}

	/**
	 * Event handler when user requests to verify authenticator code.
	 * @param event
	 */
	_onVerifyAuthenticatorClicked(event: TwoFactorAuthenticationVerificationCode): void {
		this._sb.log.trace('_onVerifyAuthenticator fired.', this);
		this._codeVerificationInProgress = true;
		this._sb.verifyAuthenticator(event);
	}

	/**
	 * Event handler when user cancels the two factor authentication setup wizard.
	 */
	_onCancelSetupWizardClicked(): void {
		this._sb.log.trace('_onCancelSetupWizard fired.', this);
		this._showServerError = false;
		this._verificationCodeForm.reset();
		this._sb.cancel2faSetupWizard();
	}

	/**
	 * Event handler when user finishes two factor authentication setup.
	 */
	_onFinish2faSetupClicked(event: TwoFactorAuthenticationSetupResult): void {
		this._sb.log.trace('_onFinish2faSetup fired.', this);
		this._showServerError = false;
		this._verificationCodeForm.reset();
		this._sb.finish2faSetup(event);
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
	 * Fired when user recovery code panel is opened.
	 */
	_onUserRecoveryCodesOpened(): void {
		this._sb.log.trace('_onUserRecoveryCodesOpened fired.', this);
		this._showServerError = false;
		this._userRecoveryCodesPanelOpened = true;
	}

	/**
	 * Fired when user submits form to change password.
	 * @param model
	 */
	_onChangeUserPasswordSubmitted(): void {
		this._sb.log.trace('_onChangeUserPasswordSubmitted fired.', this);
		const model = this._changePasswordForm.value as PasswordChange;
		this._sb.changePassword(model);
	}

	/**
	 * Fired when user recovery code panel is closed.
	 */
	_onUserRecoveryCodesClosed(): void {
		this._sb.log.trace('_onUserRecoveryCodesClosed fired.', this);
		this._userRecoveryCodesPanelOpened = false;
	}

	/**
	 * Fired when user change password view is opened.
	 */
	_onChangePasswordOpened(): void {
		this._sb.log.trace('_onChangePasswordOpened fired.', this);
		this._showServerError = false;
		this._changePasswordOpened = true;
	}

	/**
	 * Fired when user change password view is closed.
	 */
	_onChangePasswordClosed(): void {
		this._sb.log.trace('_onChangePasswordClosed fired.', this);
		this._changePasswordForm.reset();
		this._changePasswordOpened = false;
	}

	/**
	 * Whether or not this component should display server side error.
	 */
	private shouldDisplayError(): void {
		if (this._userRecoveryCodesPanelOpened === false && this._changePasswordOpened === false) {
			this._showServerError = true;
		}
	}

	/**
	 * Initializes forms for Security component container.
	 */
	private _initForms(): void {
		this._verificationCodeForm = this._initVerificationCodeForm();
		this._changePasswordForm = this._initChangePasswordForm();
		// subscribe to confirm password control to check if passwords match.
		this._subscription.add(this._validateFormConfirmPasswordField$().subscribe());
	}

	/**
	 * Validates form confirm password field.
	 * @param form
	 * @returns form confirm password field
	 */
	private _validateFormConfirmPasswordField$(): Observable<any> {
		return this._changePasswordForm.valueChanges.pipe(
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			tap((_) => {
				if (this._changePasswordForm.hasError('notSame')) {
					this._confirmPasswordMatchReqMet = false;
				} else {
					this._confirmPasswordMatchReqMet = true;
				}
			})
		);
	}

	/**
	 * Listens to security events.
	 * @returns to security events
	 */
	private _listenToSecurityEvents$(): Observable<
		| AccountSecurityDetails
		| TwoFactorAuthenticationSetupResult
		| ActionCompletion<any, Error>
		| TwoFactorAuthenticationSetup
		| ProblemDetails
		| InternalServerErrorDetails
	> {
		this._sb.log.trace('_listenToSecurityEvents executed.', this);
		return merge(
			// skip first value that emits, which is the default value.
			this._accountSecurityDetails$.pipe(skip(1)),
			// skip first value that emits, which is the default value.
			this._authenticatorSetupResult$.pipe(skip(1)),
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
	 * Initializes verification code form.
	 */
	private _initVerificationCodeForm(): FormGroup {
		return this._sb.fb.group({
			code: this._sb.fb.control(
				{ value: '', disabled: true },
				{
					validators: [OdmValidators.required, OdmValidators.minLength(VerificationCodeLength), OdmValidators.maxLength(VerificationCodeLength)],
					updateOn: 'change'
				}
			)
		});
	}

	/**
	 * Creates FormGroup for change password form.
	 * @returns change password form
	 */
	private _initChangePasswordForm(): FormGroup {
		return this._sb.fb.group(
			{
				currentPassword: this._sb.fb.control('', {
					validators: [OdmValidators.required],
					updateOn: 'change'
				}),
				password: this._sb.fb.control('', {
					validators: [
						OdmValidators.required,
						OdmValidators.minLength(MinPasswordLength),
						OdmValidators.requireDigit,
						OdmValidators.requireLowercase,
						OdmValidators.requireUppercase,
						OdmValidators.requireNonAlphanumeric,
						OdmValidators.requireThreeUniqueCharacters
					],
					updateOn: 'change'
				}),
				confirmPassword: this._sb.fb.control('', OdmValidators.required)
			},
			{
				validators: OdmValidators.requireConfirmPassword,
				updateOn: 'change'
			}
		);
	}
}
