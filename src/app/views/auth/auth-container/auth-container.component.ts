import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AuthFacadeService } from '../auth-facade.service';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { Observable } from 'rxjs';

/**
 * AuthContainer component
 */
@Component({
	selector: 'odm-auth-container',
	templateUrl: './auth-container.component.html',
	styleUrls: ['./auth-container.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthContainerComponent implements OnInit {
	validationProblemDetails$: Observable<ProblemDetails>;
	constructor(private facade: AuthFacadeService) {
		this.validationProblemDetails$ = this.facade.validationProblemDetails$;
	}

	/**
	 * NgOnInit life cycle.
	 */
	ngOnInit(): void {}
}
