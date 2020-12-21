import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { OdmValidators } from 'app/core/form-validators/odm-validators';
import { AuthFacadeService } from '../auth-facade.service';
import { ValidationMessage_Required, ValidationMessage_Email } from 'app/shared/validation-messages';

/**
 * Forgot password component.
 */
@Component({
	selector: 'odm-forgot-password',
	templateUrl: './forgot-password.component.html',
	styleUrls: ['./forgot-password.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForgotPasswordComponent implements OnInit {
	/**
	 * Forgot password form of forgot password component.
	 */
	_forgotPasswordForm: FormGroup;

	/**
	 * Field is required message.
	 */
	_fieldRequiredMessage = ValidationMessage_Required;

	/**
	 * Invalid email format message.
	 */
	_invalidEmailFormatMessage = ValidationMessage_Email;

	/**
	 * Creates an instance of forgot password component.
	 * @param fb
	 * @param facade
	 */
	constructor(private fb: FormBuilder, private facade: AuthFacadeService) {}

	/**
	 * NgOnInit life cycle.
	 */
	ngOnInit(): void {
		this._initForm();
	}

	/**
	 * Event handler for when the form is submitted.
	 */
	_onFormSubmitted(): void {
		const value = this._forgotPasswordForm.value as { email: string };
		this.facade.onForgotPassword(value.email);
	}

	/**
	 * Gets email input field error message.
	 * @returns error message
	 */
	_getErrorMessage(): string {
		const control = this._forgotPasswordForm.get('email');
		if (control.hasError('required')) {
			return this._fieldRequiredMessage;
		} else if (control.hasError('email')) {
			return this._invalidEmailFormatMessage;
		}
	}

	/**
	 * Initializes forms for forgot-password component.
	 */
	private _initForm(): void {
		this._forgotPasswordForm = this._initForgotPasswordForm();
	}

	/**
	 * Returns form group for forgot-password form.
	 * @returns forgot password form
	 */
	private _initForgotPasswordForm(): FormGroup {
		return this.fb.group({
			email: this.fb.control('', [OdmValidators.required, OdmValidators.email])
		});
	}
}
