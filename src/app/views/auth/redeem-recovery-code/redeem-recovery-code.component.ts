import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { tap } from 'rxjs/operators';
import { downUpFadeInAnimation } from 'app/core/core.module';
import { AuthSandboxService } from '../auth-sandbox.service';
import { TwoFactorRecoveryCode } from 'app/core/models/auth/two-factor-recovery-code.model';
import { ActionCompletion } from '@ngxs/store';

/**
 * When user chooses to redeem two factor authentication Recovery code, this compnent will be displayed.
 */
@Component({
	selector: 'odm-redeem-recovery-code',
	templateUrl: './redeem-recovery-code.component.html',
	styleUrls: ['./redeem-recovery-code.component.scss'],
	animations: [downUpFadeInAnimation],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class RedeemRecoveryCodeComponent implements OnInit, OnDestroy {
	/**
	 * Recovery code form.
	 */
	_recoveryCodeForm: FormGroup;

	/**
	 * Whether we are in the middle of a request to verify Recovery code.
	 */
	_recoveryCodeVerificationInProgress: boolean;

	/**
	 * Whether the Recovery code was successfully redeemed.
	 */
	_recoveryCodeVerificationSucceeded$: Observable<boolean>;

	/**
	 * Emitted when server responds with 40X error.
	 */
	_problemDetails$: Observable<ProblemDetails>;

	/**
	 * Emitted when server responds with 50X error.
	 */
	_internalServerErrorDetails$: Observable<InternalServerErrorDetails>;

	/**
	 * Recovery code input length.
	 */
	_recoveryCodeInputLength = 8;

	/**
	 * Whether two step verification cancelled action has dispatched and completed.
	 */
	private _twoStepVerificationCancelled$: Observable<ActionCompletion<any, Error>>;

	/**
	 * Whether Auth.Signin action has been dispatched and completed.
	 */
	private _signInActionCompleted$: Observable<ActionCompletion<any, Error>>;

	/**
	 * Rxjs subscriptions for this component.
	 */
	private readonly _subscription = new Subscription();

	/**
	 * User's email;
	 */
	private _email: string;

	/**
	 * Creates an instance of redeem Recovery code component.
	 * @param _sb
	 * @param _route
	 */
	constructor(private _sb: AuthSandboxService, private _route: ActivatedRoute) {
		this._recoveryCodeVerificationSucceeded$ = _sb.isRecoveryCodeRedemptionSuccessful$;
		// reset code verification value to false when server error occurs.
		this._problemDetails$ = _sb.problemDetails$.pipe(tap(() => (this._recoveryCodeVerificationInProgress = false)));
		// reset code verification value to false when server error occurs.
		this._internalServerErrorDetails$ = _sb.internalServerErrorDetails$.pipe(tap(() => (this._recoveryCodeVerificationInProgress = false)));
		this._twoStepVerificationCancelled$ = _sb.twoStepVerificationCancelled$;
		this._signInActionCompleted$ = _sb.signInActionCompleted$;
	}

	/**
	 * NgOnInit life cycle.
	 */
	ngOnInit(): void {
		this._sb.log.trace('Initialized.', this);
		this._setPropertiesFromQueryParams();
		this._subscription.add(this._listenIfUserSignedIn$().subscribe());
		this._subscription.add(this._listenIfTwoStepVerificationCancelled$().subscribe());
	}

	/**
	 * NgOnDestroy life cycle.
	 */
	ngOnDestroy(): void {
		this._sb.log.trace('Destroyed.', this);
		this._subscription.unsubscribe();
	}

	/**
	 * Event handler when user submits Recovery code to be redeemed.
	 */
	_onRecoveryCodeSubmitted(event: unknown): void {
		this._sb.log.trace('_onRecoveryCodeSubmitted fired.', this);
		this._recoveryCodeVerificationInProgress = true;
		const model = event as TwoFactorRecoveryCode;
		this._sb.log.debug('[_onRecoveryCodeSubmitted]: Setting [email] value query params.', this);
		model.email = this._email;
		this._sb.redeemRecoveryCode(model);
	}

	/**
	 * Event handler when user clicks to cancel the setup wizard.
	 */
	_onCancelClicked(): void {
		this._sb.log.trace('_onCancelClicked fired.', this);
		this._sb.cancelTwoStepVerificationCodeProcess();
	}

	/**
	 * Listens if user has signed in.
	 * @returns if user signed in$
	 */
	private _listenIfUserSignedIn$(): Observable<ActionCompletion<any, Error>> {
		this._sb.log.trace('_listenIfUserSignedIn$ fired.', this);
		return this._signInActionCompleted$.pipe(tap(() => void this._sb.router.navigate(['account'])));
	}

	/**
	 * Listens if two step verification action dispatched and completed.
	 * @returns step verification cancelled$
	 */
	private _listenIfTwoStepVerificationCancelled$(): Observable<ActionCompletion<any, Error>> {
		this._sb.log.trace('_listenIfTwoStepVerificationCancelled$ fired.', this);
		return this._twoStepVerificationCancelled$.pipe(
			tap(() => {
				void this._sb.router.navigate(['sign-in'], { relativeTo: this._route.parent });
			})
		);
	}

	/**
	 * Sets properties from route query params.
	 */
	private _setPropertiesFromQueryParams(): void {
		this._sb.log.trace('_setPropertiesFromQueryParams fired.', this);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		this._email = this._route.snapshot.queryParams['email'];
	}
}
