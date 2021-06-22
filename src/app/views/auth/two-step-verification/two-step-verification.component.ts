import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { downUpFadeInAnimation, ROUTE_ANIMATIONS_ELEMENTS } from 'app/core/core.module';
import { FormGroup } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { tap } from 'rxjs/operators';
import { AuthSandboxService } from '../auth-sandbox.service';
import { TwoFactorAuthenticationVerificationCode } from 'app/core/models/account/security/two-factor-authentication-verification-code.model';
import { TooltipTouchGestures } from '@angular/material/tooltip';
import { ODM_TOOLTIP_SHOW_DELAY_IN_MS } from 'app/shared/global-settings/mat-tooltip-settings';
import { ActionCompletion } from '@ngxs/store';

/**
 * When two step verification is required to sign user in, this component will be displayed.
 */
@Component({
	selector: 'odm-two-step-verification',
	templateUrl: './two-step-verification.component.html',
	styleUrls: ['./two-step-verification.component.scss'],
	animations: [downUpFadeInAnimation],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TwoStepVerificationComponent implements OnInit, OnDestroy {
	/**
	 * Verification code form.
	 */
	_verificationCodeForm: FormGroup;

	/**
	 * Whether we are in the middle of a request to verify two factor authentication verification code.
	 */
	_codeVerificationInProgress: boolean;

	/**
	 * Whether the verification code was successfully verfied.
	 */
	_codeVerificationSucceeded$: Observable<boolean>;

	/**
	 * Emitted when server responds with 40X error.
	 */
	_problemDetails$: Observable<ProblemDetails>;

	/**
	 * Emitted when server responds with 50X error.
	 */
	_internalServerErrorDetails$: Observable<InternalServerErrorDetails>;

	/**
	 * Touch gestrues for mat tooltip.
	 */
	readonly _touchGestrues: TooltipTouchGestures = 'on';

	/**
	 * Delay in ms for toolip.
	 */
	readonly _showDelayInMs = ODM_TOOLTIP_SHOW_DELAY_IN_MS;

	/**
	 * Route animations.
	 */
	readonly _routeAnimationsElements = ROUTE_ANIMATIONS_ELEMENTS;

	/**
	 * Provider used to perform two step authentication.
	 */
	private _provider: string;

	/**
	 * User's email;
	 */
	private _email: string;

	/**
	 * Whether two step verification action dispatched and completed
	 */
	twoStepVerificationCancelled$: Observable<ActionCompletion<any, Error>>;

	/**
	 * Whether Auth.Signin action has been dispatched and completed.
	 */
	private _signInActionCompleted$: Observable<ActionCompletion<any, Error>>;

	/**
	 * Rxjs subscriptions for this component.
	 */
	private readonly _subscription = new Subscription();
	/**
	 * Creates an instance of two step verification container component.
	 * @param _sb
	 * @param _route
	 */
	constructor(private _sb: AuthSandboxService, private _route: ActivatedRoute) {
		this._codeVerificationSucceeded$ = _sb.is2StepVerificationSuccessful$;
		// reset code verification value to false when server error occurs.
		this._problemDetails$ = _sb.problemDetails$.pipe(tap(() => (this._codeVerificationInProgress = false)));
		// reset code verification value to false when server error occurs.
		this._internalServerErrorDetails$ = _sb.internalServerErrorDetails$.pipe(tap(() => (this._codeVerificationInProgress = false)));
		this.twoStepVerificationCancelled$ = _sb.twoStepVerificationCancelled$;
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
	 * Listens if user has signed in.
	 * @returns if user signed in$
	 */
	private _listenIfUserSignedIn$(): Observable<ActionCompletion<any, Error>> {
		return this._signInActionCompleted$.pipe(tap(() => void this._sb.router.navigate(['account'])));
	}

	/**
	 * Listens if two step verification cancelled action dispatched and completed.
	 * @returns if two step verification cancelled$
	 */
	private _listenIfTwoStepVerificationCancelled$(): Observable<ActionCompletion<any, Error>> {
		return this.twoStepVerificationCancelled$.pipe(
			tap(() => {
				void this._sb.router.navigate(['sign-in'], { relativeTo: this._route.parent });
			})
		);
	}

	/**
	 * Event handler when user submits two factor authentication verification code required to sign in.
	 */
	_onVerificationCodeSubmitted(event: unknown): void {
		this._sb.log.trace('_onVerificationCodeSubmitted fired.', this);
		this._codeVerificationInProgress = true;
		const model = event as TwoFactorAuthenticationVerificationCode;
		this._sb.log.debug('[_onVerificationCodeSubmitted]: Setting [email] value query params.', this);
		model.email = this._email;
		this._sb.log.debug('[_onVerificationCodeSubmitted]: Setting [provider] value from query params.', this);
		model.provider = this._provider;
		this._sb.verifyTwoStepVerificationCode(model);
	}

	/**
	 * Event handler when user clicks to cancel the setup wizard.
	 */
	_onCancelClicked(): void {
		this._sb.log.trace('_onCancelClicked fired.', this);
		this._sb.cancelTwoStepVerificationCodeProcess();
	}

	/**
	 * Event handler when user chooses to sign in redeeming their backup code.
	 */
	_onUseRecoveryCode(): void {
		this._sb.log.trace('_onUseRecoveryCode fired.', this);
		void this._sb.router.navigate(['auth/redeem-recovery-code'], { queryParams: { email: this._email } });
	}

	/**
	 * Sets properties from route query params.
	 */
	private _setPropertiesFromQueryParams(): void {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		this._provider = this._route.snapshot.queryParams['provider'];
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		this._email = this._route.snapshot.queryParams['email'];
	}
}
