import { Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter, Input, ChangeDetectorRef } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';
import { LogService } from 'app/core/logger/log.service';
import { AuthBase } from 'app/views/auth/auth-base';
import { PasswordChange } from 'app/core/models/auth/password-change.model';
import { TranslateValidationErrorsService } from 'app/shared/services/translate-validation-errors.service';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { PasswordRequirement } from 'app/core/models/auth/password-requirement.model';

/**
 * Change user password component.
 */
@Component({
	selector: 'odm-change-password',
	templateUrl: './change-password.component.html',
	styleUrls: ['./change-password.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangePasswordComponent extends AuthBase implements OnInit {
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
	 * Signup form of auth component.
	 */
	@Input() set changePasswordForm(value: FormGroup) {
		this.log.debug('Signup form emitted.', this);
		this._changePasswordForm = value;
		this._passwordControl = value.get('password');
	}

	/**
	 * Password requirements.
	 */
	@Input() passwordRequirements: PasswordRequirement[];

	/**
	 * Change password form.
	 */
	_changePasswordForm: FormGroup;

	/**
	 * Password control of change password component.
	 */
	_passwordControl: AbstractControl;

	/**
	 * Emitted when user tries to change their password.
	 */
	@Output() changePasswordSubmitted = new EventEmitter<PasswordChange>();

	/**
	 * Emitted when user cancels out of change password view.
	 */
	@Output() cancelClicked = new EventEmitter<void>();

	/**
	 * Event emitter for when user toggles password help menu.
	 */
	@Output() passwordHelpToggled = new EventEmitter<void>();

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

	ngOnInit(): void {}

	/**
	 * Event handler for when user changes the password.
	 */
	_onChangePassword(): void {
		this.log.trace('_onChangePassword fired.', this);
		const model = this.changePasswordForm.value as PasswordChange;
		this.changePasswordSubmitted.emit(model);
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
