import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { ODM_BIG_SPINNER_DIAMETER, ODM_BIG_SPINNER_STROKE_WIDTH } from 'app/shared/global-settings/mat-spinner-settings';

/**
 * Email confirmation component.
 */
@Component({
	selector: 'odm-email-confirmation',
	templateUrl: './email-confirmation.component.html',
	styleUrls: ['./email-confirmation.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmailConfirmationComponent {
	/**
	 * Whether there is an outgoing request to confirm user's email.
	 */
	@Input() inProgress: boolean;

	/**
	 * Email confirmation in progres spinner diameter.
	 */
	_emailConfirmationInProgresSpinnerDiameter = ODM_BIG_SPINNER_DIAMETER;

	/**
	 * Email confirmation in progres stroke width.
	 */
	_emailConfirmationInProgresStrokeWidth = ODM_BIG_SPINNER_STROKE_WIDTH;
}
