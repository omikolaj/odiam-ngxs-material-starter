import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { InternalServerError } from 'app/core/error-handler/internal-server-error.decorator';
import { Observable } from 'rxjs';

@Component({
	selector: 'odm-spinner',
	templateUrl: './odm-spinner.component.html',
	styleUrls: ['./odm-spinner.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class OdmSpinnerComponent implements OnInit {
	@Input() strokeWidth: number;
	@Input() diameter: number;
	@Input() type: 'button' | 'default' = 'default';
	@InternalServerError() internalServerErrorDetails$: Observable<InternalServerErrorDetails>;

	constructor() {}

	ngOnInit(): void {}
}
