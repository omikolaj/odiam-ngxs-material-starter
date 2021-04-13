import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { OdmValidators } from 'app/core/form-validators/odm-validators';
import { leftRightFadeInAnimation } from 'app/core/core.module';
import { AuthSandboxService } from '../auth-sandbox.service';

/**
 * Forgot password container component.
 */
@Component({
	selector: 'odm-forgot-password-container',
	templateUrl: './forgot-password-container.component.html',
	styleUrls: ['./forgot-password-container.component.scss'],
	animations: [leftRightFadeInAnimation],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForgotPasswordContainerComponent implements OnInit {
	/**
	 * Forgot password form collects user entered email.
	 */
	_forgotPasswordForm: FormGroup;

	/**
	 * Whether user has submitted forgot-password form.
	 */
	_formSubmitted = false;

	/**
	 * Creates an instance of forgot password container component.
	 * @param _sb
	 */
	constructor(private _sb: AuthSandboxService) {}

	/**
	 * NgOnInit life cycle.
	 */
	ngOnInit(): void {
		this._sb.log.trace('Initialized.', this);
		this._initForm();
	}

	/**
	 * Event handler for when the form is submitted.
	 */
	_onFormSubmitted(model: { email: string }): void {
		this._sb.log.trace('_onFormSubmitted fired.', this);
		this._sb.forgotPassword(model.email);
		this._formSubmitted = true;
	}

	/**
	 * Event handler for when forgot-password form is cancelled.
	 */
	_onCancelClicked(): void {
		this._sb.log.trace('_onCancelClicked fired.', this);
		this._sb.onUpdateActiveAuthType({ activeAuthType: 'sign-in-active' });
		void this._sb.router.navigate(['auth']);
	}

	/**
	 * Event handler for when user clicks finish on forgot password component.
	 */
	_onFinishClicked(): void {
		this._sb.log.trace('_onFinishClicked fired.', this);
		void this._sb.router.navigate(['auth']);
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
		return this._sb.fb.group({
			email: this._sb.fb.control('', [OdmValidators.required, OdmValidators.email])
		});
	}
}
