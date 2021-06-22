import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { ODM_BIG_SPINNER_DIAMETER, ODM_BIG_SPINNER_STROKE_WIDTH } from 'app/shared/global-settings/mat-spinner-settings';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { downUpFadeInAnimation } from 'app/core/core.module';
import { LogService } from 'app/core/logger/log.service';

/**
 * Email confirmation component.
 */
@Component({
	selector: 'odm-email-confirmation',
	templateUrl: './email-confirmation.component.html',
	styleUrls: ['./email-confirmation.component.scss'],
	animations: [downUpFadeInAnimation],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmailConfirmationComponent {
	/**
	 * Whether there is an outgoing request to confirm user's email.
	 */
	@Input() set inProgress(value: boolean) {
		this._log.debug('inProgress property set.', this);
		this._inProgress = value;
		if (value === false) {
			this.confirmationFinished.emit({ isAuthenticated: this._isAuthenticated });
		}
	}

	_inProgress;

	/**
	 * Emitted when server responds with 50X error.
	 */
	@Input() internalServerErrorDetails: InternalServerErrorDetails;

	/**
	 * Emitted when server responds with 40X error.
	 */
	@Input() problemDetails: ProblemDetails;

	/**
	 * Whether user is authenticated.
	 */
	@Input() set isAuthenticated(value: boolean) {
		this._log.debug('isAuthenticated property set.', this);
		this._isAuthenticated = value;
	}

	_isAuthenticated: boolean;

	/**
	 * Emitts when server finished confirming user's email and there were no errors.
	 */
	@Output() confirmationFinished = new EventEmitter<{ isAuthenticated: boolean }>();

	/**
	 * Email confirmation in progres spinner diameter.
	 */
	_emailConfirmationInProgresSpinnerDiameter = ODM_BIG_SPINNER_DIAMETER;

	/**
	 * Email confirmation in progres stroke width.
	 */
	_emailConfirmationInProgresStrokeWidth = ODM_BIG_SPINNER_STROKE_WIDTH;

	/**
	 * Width of the div that the spinner is displayed in.
	 */
	_spinnerWidthCss = `${ODM_BIG_SPINNER_DIAMETER}px`;

	/**
	 * Creates an instance of email confirmation component.
	 * @param _log
	 */
	constructor(private _log: LogService) {}
}
