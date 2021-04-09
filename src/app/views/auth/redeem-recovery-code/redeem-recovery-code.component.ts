import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AuthFacadeService } from '../auth-facade.service';
import { ActivatedRoute } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { tap } from 'rxjs/operators';
import { TwoFactorRecoveryCode } from 'app/core/auth/models/two-factor-recovery-code.model';
import { leftRightFadeInAnimation } from 'app/core/core.module';

/**
 * When user chooses to redeem two factor authentication Recovery code, this compnent will be displayed.
 */
@Component({
	selector: 'odm-redeem-recovery-code',
	templateUrl: './redeem-recovery-code.component.html',
	styleUrls: ['./redeem-recovery-code.component.scss'],
	animations: [leftRightFadeInAnimation],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class RedeemRecoveryCodeComponent implements OnInit {
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
	 * User's email;
	 */
	private _email: string;

	/**
	 * Creates an instance of redeem Recovery code component.
	 * @param facade
	 * @param route
	 */
	constructor(private facade: AuthFacadeService, private route: ActivatedRoute) {
		this._recoveryCodeVerificationSucceeded$ = facade.isRecoveryCodeRedemptionSuccessful$;
		// reset code verification value to false when server error occurs.
		this._problemDetails$ = facade.problemDetails$.pipe(tap(() => (this._recoveryCodeVerificationInProgress = false)));
		// reset code verification value to false when server error occurs.
		this._internalServerErrorDetails$ = facade.internalServerErrorDetails$.pipe(tap(() => (this._recoveryCodeVerificationInProgress = false)));
	}

	/**
	 * ngOnInit life cycle.
	 */
	ngOnInit(): void {
		this.facade.log.trace('Initialized.', this);
		this._setPropertiesFromQueryParams();
	}

	/**
	 * Event handler when user submits Recovery code to be redeemed.
	 */
	_onRecoveryCodeSubmitted(event: unknown): void {
		this.facade.log.trace('_onRecoveryCodeSubmitted fired.', this);
		this._recoveryCodeVerificationInProgress = true;
		const model = event as TwoFactorRecoveryCode;
		this.facade.log.debug('[_onRecoveryCodeSubmitted]: Setting [email] value query params.', this);
		model.email = this._email;
		this.facade.redeemRecoveryCode(model);
	}

	/**
	 * Event handler when user clicks to cancel the setup wizard.
	 */
	_onCancelClicked(): void {
		this.facade.log.trace('_onCancelClicked fired.', this);
		this.facade.cancelTwoStepVerificationCodeProcess();
	}

	/**
	 * Sets properties from route query params.
	 */
	private _setPropertiesFromQueryParams(): void {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		this._email = this.route.snapshot.queryParams['email'];
	}
}
