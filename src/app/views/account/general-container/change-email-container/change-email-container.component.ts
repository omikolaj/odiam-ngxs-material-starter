import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AccountSandboxService } from '../../account-sandbox.service';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription, merge } from 'rxjs';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { FormGroup } from '@angular/forms';
import { OdmValidators } from 'app/core/form-validators/odm-validators';
import { tap, skip } from 'rxjs/operators';
import { ChangeEmailRequest } from 'app/core/models/auth/change-email-request.model';

/**
 * Change e-mail container component.
 */
@Component({
	selector: 'odm-change-email-container',
	templateUrl: './change-email-container.component.html',
	styleUrls: ['./change-email-container.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangeEmailContainerComponent implements OnInit {
	/**
	 * Emitted when server responds with 40X error.
	 */
	_problemDetails$: Observable<ProblemDetails>;

	/**
	 * Emitted when server responds with 50X error.
	 */
	_internalServerErrorDetails$: Observable<InternalServerErrorDetails>;

	/**
	 * Whether user's request to change email completed without errors.
	 */
	_changeEmailRequestSent$: Observable<boolean>;

	/**
	 * Change email form.
	 */
	_changeEmailForm: FormGroup;

	/**
	 * Whether there is an active request attempting to update user's email.
	 */
	_emailChangeInProgress: boolean;

	/**
	 * Rxjs subscriptions for this component.
	 */
	private readonly _subscription = new Subscription();

	/**
	 * Creates an instance of change email container component.
	 * @param _sb
	 * @param _route
	 */
	constructor(private _sb: AccountSandboxService, private _route: ActivatedRoute) {
		this._problemDetails$ = _sb.problemDetails$;
		this._internalServerErrorDetails$ = _sb.internalServerErrorDetails$;
		this._changeEmailRequestSent$ = _sb.changeEmailRequestSent$;
	}

	/**
	 * NgOnInit life cycle.
	 */
	ngOnInit(): void {
		this._sb.log.trace('Initialized.', this);
		this._changeEmailForm = this._initChangeEmailForm();
		this._subscription.add(this._onChangeEmailRequestSent$().subscribe());
		this._subscription.add(this._listenForServerErrors$().subscribe());
	}

	/**
	 * Event handler for when users request to change their email was successful or not.
	 * @param event
	 */
	_onRequestToChangeEmailClicked(): void {
		this._sb.log.trace('_onRequestToChangeEmailClicked fired.', this);
		this._emailChangeInProgress = true;
		const model = this._changeEmailForm.value as ChangeEmailRequest;
		this._sb.requestToChangeEmail(model);
	}

	/**
	 * Event handler for when user cancels out of the email change view.
	 */
	_onCancelClicked(): void {
		this._sb.log.trace('_onCancelClicked fired.', this);
		void this._sb.router.navigate(['general'], { relativeTo: this._route.parent });
	}

	/**
	 * Event handler for when email change request has completed. On success, change route.
	 * @returns result of email change request
	 */
	private _onChangeEmailRequestSent$(): Observable<boolean> {
		this._sb.log.trace('_onChangeEmailRequestSent$ fired.', this);
		return this._changeEmailRequestSent$.pipe(
			// skip the first emission. Default is false. Once user successfully updates email, closes the dialog and attempts to
			// reopen it, they will be re-directed to account/general because emailChangeCompleted already emitted true.
			skip(1),
			tap((result) => (result ? void this._sb.router.navigate(['general'], { relativeTo: this._route.parent }) : null)),
			tap(() => this._sb.changeEmailRequestSent({ changeEmailRequestSent: false }))
		);
	}

	/**
	 * Listens to server errors and sets problem details and internal server error details.
	 */
	private _listenForServerErrors$(): Observable<ProblemDetails | InternalServerErrorDetails> {
		this._sb.log.trace('_listenForServerErrors$ fired.', this);
		return merge(this._problemDetails$, this._internalServerErrorDetails$).pipe(
			tap(() => {
				this._emailChangeInProgress = false;
			})
		);
	}

	/**
	 * Creates FormGroup for change email form.
	 * @returns change password form
	 */
	private _initChangeEmailForm(): FormGroup {
		this._sb.log.trace('_initChangeEmailForm fired.', this);
		return this._sb.fb.group({
			newEmail: this._sb.fb.control('', {
				validators: [OdmValidators.required, OdmValidators.email],
				asyncValidators: [this._sb.asyncValidators.checkIfEmailIsUnique()],
				updateOn: 'blur'
			}),
			password: this._sb.fb.control('', OdmValidators.required)
		});
	}
}
