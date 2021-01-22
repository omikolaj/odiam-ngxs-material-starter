import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { InternalServerError } from 'app/core/error-handler/internal-server-error.decorator';
import { Observable } from 'rxjs';

/**
 * Spinner component.
 */
@Component({
	selector: 'odm-spinner',
	templateUrl: './odm-spinner.component.html',
	styleUrls: ['./odm-spinner.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class OdmSpinnerComponent {
	/**
	 * Stroke width of the progress spinner.
	 */
	@Input() strokeWidth: number;

	/**
	 * The diameter of the progress spinner (will set width and height of svg).
	 */
	@Input() diameter: number;

	/**
	 * Type of spinner. Controls the size.
	 */
	@Input() type: 'button' | 'default' = 'default';

	/**
	 * Emitted when server responds with 50X error.
	 */
	@InternalServerError() internalServerErrorDetails$: Observable<InternalServerErrorDetails>;
}
