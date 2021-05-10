import { Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { downUpFadeInAnimation } from 'app/core/core.module';
import { AccountSandboxService } from '../../account-sandbox.service';
import { PasswordChange } from 'app/core/models/auth/password-change.model';
import { FormGroup } from '@angular/forms';
import { OdmValidators, MinPasswordLength } from 'app/core/form-validators/odm-validators';
import { Observable } from 'rxjs';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { PasswordRequirement } from 'app/core/models/auth/password-requirement.model';
import { PasswordHelpToggleClass } from 'app/core/models/auth/password-help-toggle-class.model';
import { getPasswordRequirements } from 'app/core/utilities/password-requirements.utility';

/**
 * Change user password container component.
 */
@Component({
	selector: 'odm-change-password-container',
	templateUrl: './change-password-container.component.html',
	styleUrls: ['./change-password-container.component.scss'],
	animations: [downUpFadeInAnimation],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangePasswordContainerComponent implements OnInit {
	/**
	 * Emitted when server responds with 40X error.
	 */
	_problemDetails$: Observable<ProblemDetails>;

	/**
	 * Emitted when server responds with 50X error.
	 */
	_internalServerErrorDetails$: Observable<InternalServerErrorDetails>;

	/**
	 * Whether to show change password view.
	 */
	_showPasswordChange = false;

	/**
	 * Whether there is an active request attempting to update user's password.
	 */
	loading = false;

	/**
	 * Change password form.
	 */
	_changePasswordForm: FormGroup;

	/**
	 * Requires user to enter the same password for confirm password field.
	 */
	_confirmPasswordMatchReqMet = false;

	/**
	 * Password requirements required for new user.
	 */
	_passwordRequirements: PasswordRequirement[] = [];

	/**
	 * Password help toggle class.
	 */
	_passwordHelpToggleClass: PasswordHelpToggleClass = 'auth__password-field-help-off';

	/**
	 * Event emitter when user has clicked to change their password.
	 */
	@Output() changePasswordClicked = new EventEmitter<void>();

	constructor(private _sb: AccountSandboxService) {
		this._problemDetails$ = _sb.problemDetails$;
		this._internalServerErrorDetails$ = _sb.internalServerErrorDetails$;
	}

	/**
	 * ngOnInit life cycle.
	 */
	ngOnInit(): void {
		this._changePasswordForm = this._initSignupForm();
		this._passwordRequirements = this._initPasswordRequirements();
	}

	/**
	 * Event handler for when user clicks to change password.
	 */
	_onInitPasswordChangeClicked(): void {
		this._sb.log.trace('_onInitPasswordChangeClicked fired.', this);
		this._showPasswordChange = true;
	}

	/**
	 * Event handler for when user clicks to change their password.
	 * @param event
	 */
	_onChangePasswordSubmitted(event: PasswordChange): void {
		this._sb.log.trace('_onChangePasswordClicked fired.', this);
	}

	/**
	 * Event handler for when user cancels out of the password Change view.
	 */
	_onCancelClicked(): void {
		this._sb.log.trace('_onCancelClicked fired.', this);
		this._changePasswordForm.reset();
		this._showPasswordChange = false;
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
	private _initSignupForm(): FormGroup {
		return this._sb.fb.group(
			{
				oldPassword: this._sb.fb.control('', {
					validators: [OdmValidators.required],
					updateOn: 'blur'
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
