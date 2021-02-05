import { Component, ChangeDetectionStrategy, Input, EventEmitter, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { LogService } from 'app/core/logger/log.service';
import { TranslateErrorsService } from 'app/shared/services/translate-errors.service';
import { leftRightFadeInAnimation } from 'app/core/core.module';

/**
 * Forgot password component.
 */
@Component({
	selector: 'odm-forgot-password',
	templateUrl: './forgot-password.component.html',
	styleUrls: ['./forgot-password.component.scss'],
	animations: [leftRightFadeInAnimation],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForgotPasswordComponent {
	/**
	 * Forgot password form collects user entered email.
	 */
	@Input() forgotPasswordForm: FormGroup;

	/**
	 * Whether user has submitted forgot-password form.
	 */
	@Input() formSubmitted = false;

	/**
	 * Event emitter when user clicks forgot-password button.
	 */
	@Output() submitFormClicked = new EventEmitter<{ email: string }>();

	/**
	 * Event emitter when user clicks cancel button.
	 */
	@Output() cancelClicked = new EventEmitter<void>();

	/**
	 * Event emitter when user clicks finish button.
	 */
	@Output() finishClicked = new EventEmitter<void>();

	/**
	 * Creates an instance of forgot password component.
	 * @param fb
	 * @param facade
	 */
	constructor(private log: LogService, private translateError: TranslateErrorsService) {}

	/**
	 * Event handler for when the form is submitted.
	 */
	_onFormSubmitted(): void {
		this.log.trace('_onFormSubmitted fired.', this);
		const model = this.forgotPasswordForm.value as { email: string };
		this.submitFormClicked.emit(model);
	}

	/**
	 * Event handler for when user clicks finish on forgot password component.
	 */
	_onFinishClicked(): void {
		this.log.trace('_onFinishClicked fired.', this);
		this.finishClicked.emit();
	}

	/**
	 * Event handler for when forgot-password form is cancelled.
	 */
	_onCancelClicked(): void {
		this.log.trace('_onCancelClicked fired.', this);
		this.cancelClicked.emit();
	}

	/**
	 * Gets translated error message.
	 * @param errors
	 * @returns translated error message
	 */
	_getTranslatedErrorMessage$(): Observable<string> {
		const control = this.forgotPasswordForm.get('email');
		return this.translateError.translateErrorMessage$(control.errors);
	}
}
