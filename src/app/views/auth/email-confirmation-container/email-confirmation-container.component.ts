import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Observable, Subscription, merge } from 'rxjs';
import { AuthSandboxService } from '../auth-sandbox.service';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { ActivatedRoute } from '@angular/router';
import { ConfirmEmail } from 'app/core/models/auth/confirm-email.model';
import { tap } from 'rxjs/operators';

/**
 * Email confirmation container component.
 */
@Component({
	selector: 'odm-email-confirmation-container',
	templateUrl: './email-confirmation-container.component.html',
	styleUrls: ['./email-confirmation-container.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmailConfirmationContainerComponent implements OnInit, OnDestroy {
	/**
	 * Whether there is an outgoing request to confirm user's email.
	 */
	_emailConfirmationInProgress$: Observable<boolean>;

	/**
	 * Emitted when server responds with 40X error.
	 */
	_problemDetails$: Observable<ProblemDetails>;

	/**
	 * Emitted when server responds with 50X error.
	 */
	_internalServerErrorDetails$: Observable<InternalServerErrorDetails>;

	/**
	 * Rxjs subscriptions for this component.
	 */
	private readonly _subscription = new Subscription();

	/**
	 * Creates an instance of email confirmation container component.
	 * @param _sb
	 * @param _route
	 */
	constructor(private _sb: AuthSandboxService, private _route: ActivatedRoute) {
		this._problemDetails$ = _sb.problemDetails$;
		this._internalServerErrorDetails$ = _sb.internalServerErrorDetails$;
		this._emailConfirmationInProgress$ = _sb.emailConfirmationInProgress$;
	}

	/**
	 * ngOnInit life cycle.
	 */
	ngOnInit(): void {
		this._sb.log.trace('Initialized.', this);
		this._subscription.add(this._listenForServerErrors$().subscribe());

		const model: ConfirmEmail = {
			email: this._route.snapshot.queryParams['email'] as string,
			token: this._route.snapshot.queryParams['token'] as string
		};
		this._sb.confirmEmail(model);
	}

	/**
	 * ngOnDestroy life cycle.
	 */
	ngOnDestroy(): void {
		this._sb.log.trace('Destroyed.', this);
		this._subscription.unsubscribe();
	}

	/**
	 * Listens for server errors.
	 * @returns emits ProblemDetails | InternalServerErrorDetails
	 */
	private _listenForServerErrors$(): Observable<ProblemDetails | InternalServerErrorDetails> {
		this._sb.log.trace('_listenForServerErrors$ fired.', this);
		return merge(this._problemDetails$, this._internalServerErrorDetails$).pipe(
			tap(() => {
				this._sb.emailConfirmationInProgress({ emailConfirmationInProgress: false });
				void this._sb.router.navigate(['confirmation-error'], {
					relativeTo: this._route.parent,
					queryParamsHandling: 'merge',
					queryParams: { email: null, token: null }
				});
			})
		);
	}
}
