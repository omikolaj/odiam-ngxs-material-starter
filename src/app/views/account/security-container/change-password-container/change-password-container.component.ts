import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { PasswordRequirement } from 'app/core/models/auth/password-requirement.model';
import { PasswordHelpToggleClass } from 'app/core/models/auth/password-help-toggle-class.model';
import { getPasswordRequirements } from 'app/core/utilities/password-requirements.utility';
import { FormGroup } from '@angular/forms';
import { ODM_GLOBAL_SECURITY_SHORT_DESCRIPTION } from 'app/shared/global-settings/global-settings';
import { ActivatedRoute } from '@angular/router';
import { SecuritySandboxService } from '../security-sandbox.service';
import { Observable, Subscription, merge, Subject } from 'rxjs';
import { OdmValidators, MinPasswordLength } from 'app/core/form-validators/odm-validators';
import { tap, skip } from 'rxjs/operators';
import { PasswordChange } from 'app/core/models/auth/password-change.model';
import { PasswordResetMatTreeState } from 'app/core/models/password-reset-mat-tree-state.model';
import { ROUTE_ANIMATIONS_ELEMENTS } from 'app/core/core.module';

/**
 * Change user password container component.
 */
@Component({
	selector: 'odm-change-password-container',
	templateUrl: './change-password-container.component.html',
	styleUrls: ['./change-password-container.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangePasswordContainerComponent implements OnInit, OnDestroy {
	/**
	 * Route animations.
	 */
	readonly _routeAnimationsElements = ROUTE_ANIMATIONS_ELEMENTS;

	/**
	 * Emitted when server responds with 40X error.
	 */
	_problemDetails$: Observable<ProblemDetails>;

	/**
	 * Emitted when server responds with 50X error.
	 */
	_internalServerErrorDetails$: Observable<InternalServerErrorDetails>;

	/**
	 * Requires user to enter the same password for confirm password field.
	 */
	_confirmPasswordMatchReqMet = false;

	/**
	 * Change password form.
	 */
	_changePasswordForm: FormGroup;

	/**
	 * Whether there is an active request attempting to update user's password.
	 */
	_passwordChangeInProgress: boolean;

	/**
	 * Whether user's password change request completed without errors.
	 */
	_passwordChangeCompleted$: Observable<boolean>;

	/**
	 * Password requirements required for new user.
	 */
	_passwordRequirements: PasswordRequirement[] = [];

	/**
	 * Password help toggle class.
	 */
	_passwordHelpToggleClass: PasswordHelpToggleClass = 'auth__password-field-help-off';

	/**
	 * Short description font size.
	 */
	readonly _shortDescription = ODM_GLOBAL_SECURITY_SHORT_DESCRIPTION;

	/**
	 * Whether password help dialog is expanded or collapsed.
	 */
	private _passwordHelpTogglePositionSub = new Subject<PasswordResetMatTreeState>();

	/**
	 * Whether password help dialog is expanded or collapsed.
	 */
	_passwordHelpTogglePosition$ = this._passwordHelpTogglePositionSub.asObservable();

	/**
	 * Rxjs subscriptions for this component.
	 */
	private readonly _subscription = new Subscription();

	/**
	 * Creates an instance of change password container component.
	 * @param _log
	 */
	constructor(private _sb: SecuritySandboxService, private _route: ActivatedRoute) {
		this._problemDetails$ = _sb.problemDetails$;
		this._internalServerErrorDetails$ = _sb.internalServerErrorDetails$;
		this._passwordChangeCompleted$ = _sb.passwordChangeCompleted$;
	}

	/**
	 * ngOnInit life cycle.
	 */
	ngOnInit(): void {
		this._sb.log.trace('Initialized.', this);
		this._passwordRequirements = this._initPasswordRequirements();
		this._changePasswordForm = this._initChangePasswordForm();
		this._subscription.add(this._validateFormConfirmPasswordField$().subscribe());
		this._subscription.add(this._listenForServerErrors$().subscribe());
		this._subscription.add(this._onPasswordChangeCompleted$().subscribe());
	}

	/**
	 * ngOnDestroy life cycle.
	 */
	ngOnDestroy(): void {
		this._sb.log.trace('Destroyed.', this);
		this._subscription.unsubscribe();
	}

	/**
	 * Event handler for when user clicks to change their password.
	 * @param event
	 */
	_onChangePasswordSubmitted(): void {
		this._sb.log.trace('_onChangePasswordClicked fired.', this);
		this._passwordChangeInProgress = true;
		const model = this._changePasswordForm.value as PasswordChange;
		this._sb.changePassword(model);
	}

	/**
	 * Event handler for when user cancels out of the password Change view.
	 */
	_onCancelClicked(): void {
		this._sb.log.trace('_onCancelClicked fired.', this);
		void this._sb.router.navigate(['./'], { relativeTo: this._route.parent });
	}

	/**
	 * Event handler when user toggles password help.
	 */
	_onPasswordHelpToggled(): void {
		this._sb.log.trace('_onPasswordHelpToggled fired.', this);
		if (this._passwordHelpToggleClass === 'auth__password-field-help-off') {
			this._passwordHelpToggleClass = 'auth__password-field-help-on';
		} else {
			this._passwordHelpToggleClass = 'auth__password-field-help-off';
		}
	}

	/**
	 * Event handler for when password change has completed. On successful change we change route.
	 * @returns result of password change request
	 */
	private _onPasswordChangeCompleted$(): Observable<boolean> {
		this._sb.log.trace('_onPasswordChangeCompleted$ fired.', this);
		return this._passwordChangeCompleted$.pipe(
			// skip the first emission. Default is false. Once user successfully updates password, closes the dialog and attempts to
			// reopen it, they will be re-directed to account/security because passwordChangeCompleted already emitted true.
			skip(1),
			tap((result) => (result ? void this._sb.router.navigate(['./'], { relativeTo: this._route.parent }) : null))
		);
	}

	/**
	 * Validates form confirm password field.
	 * @param form
	 * @returns form confirm password field
	 */
	private _validateFormConfirmPasswordField$(): Observable<any> {
		this._sb.log.trace('_validateFormConfirmPasswordField$ fired.', this);
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
	 * Subscribes to server errors and sets problem details and internal server error details.
	 */
	private _listenForServerErrors$(): Observable<ProblemDetails | InternalServerErrorDetails> {
		this._sb.log.trace('_listenForServerErrors$ fired.', this);
		return merge(this._sb.problemDetails$, this._sb.internalServerErrorDetails$).pipe(
			tap(() => {
				this._sb.log.debug(`Changing _togglePosition to 'collapsed'`);
				this._passwordHelpTogglePositionSub.next('collapsed');
				this._passwordChangeInProgress = false;
			})
		);
	}

	/**
	 * Inits new user's password requirements.
	 */
	private _initPasswordRequirements(): PasswordRequirement[] {
		return getPasswordRequirements();
	}

	/**
	 * Creates FormGroup for change password form.
	 * @returns change password form
	 */
	private _initChangePasswordForm(): FormGroup {
		this._sb.log.trace('_initChangePasswordForm fired.', this);
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
