import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { OdmValidators } from 'app/core/form-validators/odm-validators';
import { ROUTE_ANIMATIONS_ELEMENTS } from 'app/core/core.module';
import { AuthSandboxService } from '../auth-sandbox.service';
import { Observable, merge, Subscription } from 'rxjs';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { tap } from 'rxjs/operators';

/**
 * Forgot password container component.
 */
@Component({
	selector: 'odm-forgot-password-container',
	templateUrl: './forgot-password-container.component.html',
	styleUrls: ['./forgot-password-container.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForgotPasswordContainerComponent implements OnInit, OnDestroy {
	/**
	 * Emitted when server responds with 50X error.
	 */
	_internalServerErrorDetails$: Observable<InternalServerErrorDetails>;

	/**
	 * Route animations.
	 */
	readonly _routeAnimationsElements = ROUTE_ANIMATIONS_ELEMENTS;

	/**
	 * Forgot password form collects user entered email.
	 */
	_forgotPasswordForm: FormGroup;

	/**
	 * Whether user has submitted forgot-password form.
	 */
	_forgotPasswordRequestSubmittedSuccessfully$: Observable<boolean>;

	/**
	 * Whether there is an outgoing request to send forgot password instructions.
	 */
	_forgotPasswordRequestSubmitting$: Observable<boolean>;

	/**
	 * Rxjs subscriptions for this component.
	 */
	private readonly _subscription = new Subscription();

	/**
	 * Creates an instance of forgot password container component.
	 * @param _sb
	 */
	constructor(private _sb: AuthSandboxService) {
		this._internalServerErrorDetails$ = _sb.internalServerErrorDetails$;
		this._forgotPasswordRequestSubmittedSuccessfully$ = _sb.forgotPasswordRequestSubmittedSuccessfully$;
		this._forgotPasswordRequestSubmitting$ = _sb.forgotPasswordRequestSubmitting$;
	}

	/**
	 * NgOnInit life cycle.
	 */
	ngOnInit(): void {
		this._sb.log.trace('Initialized.', this);
		this._initForm();
		this._subscription.add(this._listenForServerErrors$().subscribe());
	}

	/**
	 * NgOnDestroy life cycle.
	 */
	ngOnDestroy(): void {
		this._sb.log.trace('Destroyed.', this);
		// reset submitted successfully flag once this component is destroyed.
		this._sb.forgotPasswordRequestSubmittedSuccessfully({ forgotPasswordRequestSubmittedSuccessfully: false });
		this._subscription.unsubscribe();
	}

	/**
	 * Event handler for when the form is submitted.
	 */
	_onFormSubmitted(model: { email: string }): void {
		this._sb.log.trace('_onFormSubmitted fired.', this);
		this._sb.forgotPassword(model.email);
	}

	/**
	 * Event handler for when forgot-password form is cancelled.
	 */
	_onCancelClicked(): void {
		this._sb.log.trace('_onCancelClicked fired.', this);
		this._sb.updateActiveAuthType({ activeAuthType: 'sign-in-active' });
		void this._sb.router.navigate(['auth']);
	}

	/**
	 * Event handler for when user clicks finish on forgot password component.
	 */
	_onFinishClicked(): void {
		this._sb.log.trace('_onFinishClicked fired.', this);
		void this._sb.router.navigate(['auth']);
	}

	/**
	 * Listens to server errors and sets problem details and internal server error details.
	 */
	private _listenForServerErrors$(): Observable<InternalServerErrorDetails> {
		this._sb.log.trace('_listenForServerErrors$ fired.', this);
		return merge(this._internalServerErrorDetails$).pipe(
			tap(() => {
				this._sb.forgotPasswordRequestSubmittedSuccessfully({ forgotPasswordRequestSubmittedSuccessfully: false });
				this._sb.forgotPasswordRequestSubmitting({ forgotPasswordRequestSubmitting: false });
			})
		);
	}

	/**
	 * Initializes forms for forgot-password component.
	 */
	private _initForm(): void {
		this._forgotPasswordForm = this._initForgotPasswordForm();
	}

	/**
	 * Returns form group for forgot-password form.
	 * @returns forgot password form
	 */
	private _initForgotPasswordForm(): FormGroup {
		return this._sb.fb.group({
			email: this._sb.fb.control('', [OdmValidators.required, OdmValidators.email])
		});
	}
}
