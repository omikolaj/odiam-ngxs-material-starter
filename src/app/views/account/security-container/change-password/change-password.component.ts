import { Component, ChangeDetectionStrategy, Output, EventEmitter, Input, ChangeDetectorRef } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';
import { LogService } from 'app/core/logger/log.service';
import { AuthBase } from 'app/views/auth/auth-base';
import { TranslateValidationErrorsService } from 'app/shared/services/translate-validation-errors.service';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { PasswordRequirement } from 'app/core/models/auth/password-requirement.model';
import { PasswordHelpToggleClass } from 'app/core/models/auth/password-help-toggle-class.model';
import { ODM_SMALL_SPINNER_DIAMETER, ODM_SMALL_SPINNER_STROKE_WIDTH } from 'app/shared/global-settings/mat-spinner-settings';
import { PasswordResetMatTreeState } from 'app/core/models/password-reset-mat-tree-state.model';

/**
 * Change user password component.
 */
@Component({
	selector: 'odm-change-password',
	templateUrl: './change-password.component.html',
	styleUrls: ['./change-password.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangePasswordComponent extends AuthBase {
	/**
	 * Emitted when server responds with 40X error.
	 */
	@Input() set problemDetails(value: ProblemDetails) {
		this.log.debug('Problem details emitted.', this);
		this.problemDetailsError = value;
	}

	/**
	 * Emitted when server responds with 50X error.
	 */
	@Input() set internalServerErrorDetails(value: InternalServerErrorDetails) {
		this.log.debug('Internal server error emitted.', this);
		this.internalServerError = value;
	}

	/**
	 * Change password form.
	 */
	@Input() set changePasswordForm(value: FormGroup) {
		this.log.debug('Change password form emitted.', this);
		this._changePasswordForm = value;
		this._passwordControl = value.get('password');
	}

	/**
	 * Password requirements.
	 */
	@Input() passwordRequirements: PasswordRequirement[];

	/**
	 * Password help toggle class.
	 */
	@Input() passwordHelpToggleClass: PasswordHelpToggleClass;

	/**
	 * Requires user to enter the same password for confirm password field.
	 */
	@Input() confirmPasswordMatchReqMet: boolean;

	/**
	 * Whether there currently is a request to change user's password.
	 */
	@Input() passwordChangeInProgress: boolean;

	/**
	 * Password help toggle position.
	 */
	@Input() passwordHelpTogglePosition: PasswordResetMatTreeState;

	/**
	 * Emitted when user tries to change their password.
	 */
	@Output() changePasswordSubmitted = new EventEmitter<void>();

	/**
	 * Emitted when user cancels out of change password view.
	 */
	@Output() cancelClicked = new EventEmitter<void>();

	/**
	 * Event emitter for when user toggles password help menu.
	 */
	@Output() passwordHelpToggled = new EventEmitter<void>();

	/**
	 * Change password form.
	 */
	_changePasswordForm: FormGroup;

	/**
	 * Password control of change password component.
	 */
	_passwordControl: AbstractControl;

	/**
	 * Hide/show current password.
	 */
	_currentPasswordHide = true;

	/**
	 * Hide/show new password.
	 */
	_newPasswordHide = true;

	/**
	 * Hide/show confirm password.
	 */
	_confirmPasswordHide = true;

	/**
	 * Changing password spinner diameter.
	 */
	readonly _changingPasswordSpinnerDiameter = ODM_SMALL_SPINNER_DIAMETER;

	/**
	 * Changing password spinner stroke width.
	 */
	readonly _changingPasswordSpinnerStrokeWidth = ODM_SMALL_SPINNER_STROKE_WIDTH;

	/**
	 * Creates an instance of change password component.
	 * @param translateErrorValidationService
	 * @param log
	 * @param cd
	 */
	constructor(
		protected translateErrorValidationService: TranslateValidationErrorsService,
		protected log: LogService,
		protected cd: ChangeDetectorRef
	) {
		super(translateErrorValidationService, log, cd);
	}

	/**
	 * Event handler for when user changes the password.
	 */
	_onChangePassword(): void {
		this.log.trace('_onChangePassword fired.', this);
		this.changePasswordSubmitted.emit();
	}

	/**
	 * Event handler when user toggles password help.
	 */
	_onPasswordHelpToggled(): void {
		this.log.trace('_onPasswordHelpToggled fired.', this);
		this.passwordHelpToggled.emit();
	}

	/**
	 * Event handler for when user cancels out of the change password view.
	 */
	_cancelClicked(): void {
		this.log.trace('_cancelClicked fired.', this);
		this.cancelClicked.emit();
	}
}
