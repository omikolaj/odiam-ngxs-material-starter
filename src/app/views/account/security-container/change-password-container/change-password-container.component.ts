import { Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter, Input } from '@angular/core';
import { downUpFadeInAnimation } from 'app/core/core.module';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { PasswordRequirement } from 'app/core/models/auth/password-requirement.model';
import { PasswordHelpToggleClass } from 'app/core/models/auth/password-help-toggle-class.model';
import { getPasswordRequirements } from 'app/core/utilities/password-requirements.utility';
import { LogService } from 'app/core/logger/log.service';
import { FormGroup } from '@angular/forms';

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
	 * Emitted when server responds with 40X or 50X error.
	 */
	@Input() serverError: ProblemDetails | InternalServerErrorDetails;

	/**
	 * Emitted when server responds with 40X error.
	 */
	@Input() problemDetails: ProblemDetails;

	/**
	 * Emitted when server responds with 50X error.
	 */
	@Input() internalServerErrorDetails: InternalServerErrorDetails;

	/**
	 * Requires user to enter the same password for confirm password field.
	 */
	@Input() confirmPasswordMatchReqMet = false;

	/**
	 * Change password form.
	 */
	@Input() changePasswordForm: FormGroup;

	/**
	 * Whether user's password change request completed without errors.
	 */
	@Input() set passwordChangeCompleted(value: boolean) {
		this._log.debug('passwordChangeCompleted emitted. Value:', this, value);
		if (value) {
			this._showPasswordChange = false;
			this.changePasswordClosed.emit();
		}
	}

	/**
	 * Event emitter when user has submitted to change their password.
	 */
	@Output() changePasswordSubmitted = new EventEmitter<void>();

	/**
	 * Event emitter when user has closed change password view.
	 */
	@Output() changePasswordClosed = new EventEmitter<void>();

	/**
	 * Whether to show change password view.
	 */
	_showPasswordChange = false;

	/**
	 * Whether there is an active request attempting to update user's password.
	 */
	loading = false;

	/**
	 * Password requirements required for new user.
	 */
	_passwordRequirements: PasswordRequirement[] = [];

	/**
	 * Password help toggle class.
	 */
	_passwordHelpToggleClass: PasswordHelpToggleClass = 'auth__password-field-help-off';

	/**
	 * Creates an instance of change password container component.
	 * @param _log
	 */
	constructor(private _log: LogService) {}

	/**
	 * ngOnInit life cycle.
	 */
	ngOnInit(): void {
		this._log.trace('Initialized.', this);
		this._passwordRequirements = this._initPasswordRequirements();
	}

	/**
	 * Event handler for when user clicks to change password.
	 */
	_onInitPasswordChangeClicked(): void {
		this._log.trace('_onInitPasswordChangeClicked fired.', this);
		this._showPasswordChange = true;
	}

	/**
	 * Event handler for when user clicks to change their password.
	 * @param event
	 */
	_onChangePasswordSubmitted(): void {
		this._log.trace('_onChangePasswordClicked fired.', this);
		this.changePasswordSubmitted.emit();
	}

	/**
	 * Event handler for when user cancels out of the password Change view.
	 */
	_onCancelClicked(): void {
		this._log.trace('_onCancelClicked fired.', this);
		this._showPasswordChange = false;
		this.changePasswordClosed.emit();
	}

	/**
	 * Event handler when user toggles password help.
	 */
	_onPasswordHelpToggled(): void {
		this._log.trace('_onPasswordHelpToggled fired.', this);
		if (this._passwordHelpToggleClass === 'auth__password-field-help-off') {
			this._passwordHelpToggleClass = 'auth__password-field-help-on';
		} else {
			this._passwordHelpToggleClass = 'auth__password-field-help-off';
		}
	}

	/**
	 * Inits new user's password requirements.
	 */
	private _initPasswordRequirements(): PasswordRequirement[] {
		return getPasswordRequirements();
	}
}
