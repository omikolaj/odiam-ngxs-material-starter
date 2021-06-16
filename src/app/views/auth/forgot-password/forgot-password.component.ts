import { Component, ChangeDetectionStrategy, Input, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { LogService } from 'app/core/logger/log.service';
import { ROUTE_ANIMATIONS_ELEMENTS, downUpFadeInAnimation } from 'app/core/core.module';
import { AuthBase } from '../auth-base';
import { TranslateValidationErrorsService } from 'app/shared/services/translate-validation-errors.service';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { ODM_SMALL_SPINNER_DIAMETER, ODM_SMALL_SPINNER_STROKE_WIDTH } from 'app/shared/global-settings/mat-spinner-settings';

/**
 * Forgot password component.
 */
@Component({
	selector: 'odm-forgot-password',
	templateUrl: './forgot-password.component.html',
	styleUrls: ['./forgot-password.component.scss'],
	animations: [downUpFadeInAnimation],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForgotPasswordComponent extends AuthBase {
	/**
	 * Route animations.
	 */
	readonly _routeAnimationsElements = ROUTE_ANIMATIONS_ELEMENTS;

	/**
	 * Emitted when server responds with 50X error.
	 */
	@Input() set internalServerErrorDetails(value: InternalServerErrorDetails) {
		this.log.debug('Internal server error emitted.', this);
		this.internalServerError = value;
	}

	/**
	 * Forgot password form collects user entered email.
	 */
	@Input() forgotPasswordForm: FormGroup;

	/**
	 * Whether there is an outgoing request to send forgot password instructions.
	 */
	@Input() forgotPasswordRequestSubmitting = false;

	/**
	 * Whether forgot password request was handled by the server without errors.
	 */
	@Input() forgotPasswordRequestSubmittedSuccessfully = false;

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
	 * Forgot password spinner diameter.
	 */
	readonly _forgotPasswordSpinnerDiameter = ODM_SMALL_SPINNER_DIAMETER;

	/**
	 * Forgot password spinner stroke width.
	 */
	readonly _forgotPasswordSpinnerStrokeWidth = ODM_SMALL_SPINNER_STROKE_WIDTH;

	/**
	 * Creates an instance of forgot password component.
	 * @param _log
	 * @param _translateError
	 */
	constructor(protected log: LogService, translateErrorValidationService: TranslateValidationErrorsService, cd: ChangeDetectorRef) {
		super(translateErrorValidationService, log, cd);
	}

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
}
