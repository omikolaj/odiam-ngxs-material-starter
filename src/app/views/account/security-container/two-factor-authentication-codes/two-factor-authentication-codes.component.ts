import { Component, ChangeDetectionStrategy, Output, EventEmitter, Input } from '@angular/core';
import { TooltipTouchGestures } from '@angular/material/tooltip';
import { ODM_TOOLTIP_SHOW_DELAY_IN_MS } from 'app/shared/mat-tooltip-settings';
import { LogService } from 'app/core/logger/log.service';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { implementsOdmWebApiException } from 'app/core/utilities/implements-odm-web-api-exception';
import { upDownFadeInAnimation, fadeInAnimation } from 'app/core/animations/element.animations';

/**
 * Two factor authentication codes component.
 */
@Component({
	selector: 'odm-two-factor-authentication-codes',
	templateUrl: './two-factor-authentication-codes.component.html',
	styleUrls: ['./two-factor-authentication-codes.component.scss'],
	animations: [upDownFadeInAnimation, fadeInAnimation],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TwoFactorAuthenticationCodesComponent {
	/**
	 * Event emitter when user requests to generate new recovery codes.
	 */
	@Output() generateNewRecoveryCodes = new EventEmitter<void>();
	/**
	 * Recovery codes user has left to redeem for logging in.
	 */
	@Input() codes: string[] = [];

	/**
	 * Determines whether there is an outgoing request to generate new recovery codes.
	 */
	@Input() generatingCodes = false;

	/**
	 * Indicates whether problem details error has been handled.
	 */
	private _problemDetailsErrorHandled = false;

	/**
	 * Indicates whether internal server error has been handled.
	 */
	private _internalServerErrorHandled = false;

	/**
	 * When the request results in an error other than 50X server error.
	 */
	@Input() set problemDetails(value: ProblemDetails) {
		this._problemDetailsErrorHandled = false;
		this._problemDetails = value;
	}

	/**
	 * Problem details.
	 */
	_problemDetails: ProblemDetails;

	/**
	 * Internal server error details$ of auth container component.
	 */
	@Input() set internalServerErrorDetails(value: InternalServerErrorDetails) {
		this._internalServerErrorHandled = false;
		this._internalServerErrorDetails = value;
	}

	/**
	 * Internal server error.
	 */
	_internalServerErrorDetails: InternalServerErrorDetails;

	/**
	 * Touch gestrues of two factor authentication codes component.
	 */
	_touchGestrues: TooltipTouchGestures = 'on';

	/**
	 * Show delay in ms for toolip.
	 */
	_showDelayInMs = ODM_TOOLTIP_SHOW_DELAY_IN_MS;

	/**
	 * Generating recovery codes spinner diameter.
	 */
	_generatingCodesSpinnerDiameter = 15;

	/**
	 * Generating recovery codes spinner stroke width.
	 */
	_generatingCodesSpinnerStrokeWidth = 1;

	/**
	 * Gets whether problem details emitted and it hasn't been handled yet.
	 */
	get _isProblemDetailsError(): boolean {
		return !!this._problemDetails && !this._problemDetailsErrorHandled;
	}

	/**
	 * Gets whether internal server error emitted and it hasn't been handled yet.
	 */
	get _isInternalServerError(): boolean {
		return !!this._internalServerErrorDetails && !this._internalServerErrorHandled;
	}

	/**
	 * Checks if internal server error implements problem details
	 */
	private get _doesInternalServerErrorImplementOdmWebApiException(): boolean {
		return implementsOdmWebApiException(this._internalServerErrorDetails);
	}

	/**
	 * Creates an instance of two factor authentication codes component.
	 * @param logger
	 */
	constructor(private logger: LogService) {}

	/**
	 * Event handler when user requests to generate new recovery codes.
	 */
	_onGenerateNewRecoveryCodes(): void {
		this.logger.trace('_onGenerateNewRecoveryCodes fired.', this);
		this.generateNewRecoveryCodes.emit();
	}

	/**
	 * Gets problem details error message.
	 * @returns problem details error message
	 */
	_getProblemDetailsErrorMessage(): string {
		this._problemDetailsErrorHandled = true;
		return this._problemDetails.detail;
	}

	/**
	 * Gets internal server error message.
	 * @returns internal server error message
	 */
	_getInternalServerErrorMessage(): string {
		this._internalServerErrorHandled = true;
		if (this._doesInternalServerErrorImplementOdmWebApiException) {
			return this._internalServerErrorDetails.detail;
		} else {
			return this._internalServerErrorDetails.message;
		}
	}
}
