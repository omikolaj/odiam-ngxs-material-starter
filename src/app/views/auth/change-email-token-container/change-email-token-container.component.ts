import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable, merge, Subscription } from 'rxjs';
import { AuthSandboxService } from '../auth-sandbox.service';
import { ActivatedRoute } from '@angular/router';
import { ChangeEmail } from 'app/core/models/auth/change-email.model';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { tap } from 'rxjs/operators';

/**
 * Change email token container component.
 */
@Component({
	selector: 'odm-change-email-token-container',
	templateUrl: './change-email-token-container.component.html',
	styleUrls: ['./change-email-token-container.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangeEmailTokenContainerComponent implements OnInit {
	/**
	 * Emitted when server responds with 40X error.
	 */
	_problemDetails$: Observable<ProblemDetails>;

	/**
	 * Emitted when server responds with 50X error.
	 */
	_internalServerErrorDetails$: Observable<InternalServerErrorDetails>;

	/**
	 * Whether there is an outgoing request to verify user's change email token and update the email.
	 */
	_changeEmailConfirmationInProgress$: Observable<boolean>;

	/**
	 * Rxjs subscriptions for this component.
	 */
	private readonly _subscription = new Subscription();

	/**
	 * Creates an instance of change email token container component.
	 * @param _sb
	 * @param _route
	 */
	constructor(private _sb: AuthSandboxService, private _route: ActivatedRoute) {
		this._problemDetails$ = _sb.problemDetails$;
		this._internalServerErrorDetails$ = _sb.internalServerErrorDetails$;
		this._changeEmailConfirmationInProgress$ = _sb.changeEmailConfirmationInProgress$;
	}

	/**
	 * ngOnInit life cycle.
	 */
	ngOnInit(): void {
		this._subscription.add(this._listenForServerErrors$().subscribe());
		const id = this._route.snapshot.paramMap.get('id');
		const model: ChangeEmail = {
			newEmail: this._route.snapshot.queryParams['newEmail'] as string,
			token: this._route.snapshot.queryParams['token'] as string
		};

		this._sb.confirmEmailChangeRequest(id, model);
	}

	/**
	 * Subscribes to server errors and sets problem details and internal server error details.
	 * @returns emits ProblemDetails | InternalServerErrorDetails observable
	 */
	private _listenForServerErrors$(): Observable<ProblemDetails | InternalServerErrorDetails> {
		this._sb.log.trace('_listenForServerErrors$ fired.', this);
		return merge(this._problemDetails$, this._internalServerErrorDetails$).pipe(
			tap(() => {
				this._sb.changeEmailConfirmationInProgress({ changeEmailConfirmationInProgress: false });
				void this._sb.router.navigate(['confirmation-error'], { relativeTo: this._route.parent });
			})
		);
	}
}
