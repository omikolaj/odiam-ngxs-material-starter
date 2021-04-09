import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { leftRightFadeInAnimation } from 'app/core/core.module';
import { FormGroup } from '@angular/forms';
import { AuthFacadeService } from '../auth-facade.service';
import { TwoFactorAuthenticationVerificationCode } from 'app/views/account/security-container/two-factor-authentication/models/two-factor-authentication-verification-code.model';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { tap } from 'rxjs/operators';

/**
 * When two step verification is required to sign user in, this component will be displayed.
 */
@Component({
	selector: 'odm-two-step-verification',
	templateUrl: './two-step-verification.component.html',
	styleUrls: ['./two-step-verification.component.scss'],
	animations: [leftRightFadeInAnimation],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TwoStepVerificationComponent implements OnInit {
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
	 * Provider used to perform two step authentication.
	 */
	private _provider: string;

	/**
	 * User's email;
	 */
	private _email: string;

	/**
	 * Creates an instance of two step verification container component.
	 * @param facade
	 */
	constructor(private facade: AuthFacadeService, private route: ActivatedRoute) {
		this._codeVerificationSucceeded$ = facade.is2StepVerificationSuccessful$;
		// reset code verification value to false when server error occurs.
		this._problemDetails$ = facade.problemDetails$.pipe(tap(() => (this._codeVerificationInProgress = false)));
		// reset code verification value to false when server error occurs.
		this._internalServerErrorDetails$ = facade.internalServerErrorDetails$.pipe(tap(() => (this._codeVerificationInProgress = false)));
	}

	/**
	 * NgOnInit life cycle.
	 */
	ngOnInit(): void {
		this.facade.log.trace('Initialized.', this);
		this._setPropertiesFromQueryParams();
	}

	/**
	 * Event handler when user submits two factor authentication verification code required to sign in.
	 */
	_onVerificationCodeSubmitted(event: unknown): void {
		this.facade.log.trace('_onVerificationCodeSubmitted fired.', this);
		this._codeVerificationInProgress = true;
		const model = event as TwoFactorAuthenticationVerificationCode;
		this.facade.log.debug('[_onVerificationCodeSubmitted]: Setting [email] value query params.', this);
		model.email = this._email;
		this.facade.log.debug('[_onVerificationCodeSubmitted]: Setting [provider] value from query params.', this);
		model.provider = this._provider;
		this.facade.verifyTwoStepVerificationCode(model);
	}

	/**
	 * Event handler when user clicks to cancel the setup wizard.
	 */
	_onCancelClicked(): void {
		this.facade.log.trace('_onCancelClicked fired.', this);
		this.facade.cancelTwoStepVerificationCodeProcess();
	}

	/**
	 * Event handler when user chooses to sign in redeeming their backup code.
	 */
	_onUseRecoveryCode(): void {
		this.facade.log.trace('_onUseRecoveryCode fired.', this);
		void this.facade.router.navigate(['auth/redeem-recovery-code'], { queryParams: { email: this._email } });
	}

	/**
	 * Sets properties from route query params.
	 */
	private _setPropertiesFromQueryParams(): void {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		this._provider = this.route.snapshot.queryParams['provider'];
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		this._email = this.route.snapshot.queryParams['email'];
	}
}
