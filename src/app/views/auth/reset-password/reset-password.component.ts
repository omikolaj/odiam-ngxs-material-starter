import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AuthFacadeService } from '../auth-facade.service';
import { PasswordReset } from 'app/core/auth/models/password-reset.model';
import { ProblemDetails } from 'app/core/models/problem-details.model';

import { ROUTE_ANIMATIONS_ELEMENTS } from 'app/core/core.module';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { Observable, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

import { OdmValidators } from 'app/core/form-validators/odm-validators';
import { AuthBase } from '../auth-base';

/**
 * Reset password component.
 */
@Component({
	selector: 'odm-reset-password',
	templateUrl: './reset-password.component.html',
	styleUrls: ['./reset-password.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetPasswordComponent extends AuthBase implements OnInit, OnDestroy {
	/**
	 * Reset password form of reset password component.
	 */
	_resetPasswordForm: FormGroup;

	/**
	 * Emitted when server responds with 40X error.
	 */
	set problemDetails(value: Observable<ProblemDetails>) {
		this.facade.log.debug('Problem details emitted.', this);
		this._problemDetailsServerErrorHandled = false;
		this._subscription.add(
			value
				.pipe(
					tap((value: ProblemDetails) => {
						this._problemDetails = value;
					})
				)
				.subscribe()
		);
	}

	/**
	 * InternalServerErrorDetails for when server crashes and responds with 50X error.
	 */
	set internalServerErrorDetails(value: Observable<InternalServerErrorDetails>) {
		this.facade.log.debug('Internal server details emitted.', this);
		this._subscription.add(
			value
				.pipe(
					tap((value: InternalServerErrorDetails) => {
						this._internalServerErrorDetails = value;
					})
				)
				.subscribe()
		);
	}

	/**
	 * Route animations elements of auth component.
	 */
	_routeAnimationsElements = ROUTE_ANIMATIONS_ELEMENTS;

	/**
	 * Hide/show password.
	 */
	_hide = true;

	/**
	 * Password length requirement for password control.
	 * Used to inform user about password requirement.
	 */
	_passwordLengthReqMet = false;

	/**
	 * Password uppercase requirement for password control.
	 * Used to inform user about password requirement.
	 */
	_passwordUppercaseReqMet = false;

	/**
	 * Password lowercase requirement for password control.
	 * Used to inform user about password requirement.
	 */
	_passwordLowercaseReqMet = false;

	/**
	 * Password digit requirement for password control.
	 * Used to inform user about password requirement.
	 */
	_passwordDigitReqMet = false;

	/**
	 * Requires user to enter in at least three unique characters.
	 */
	_passwordThreeUniqueCharacterCountReqMet = false;

	/**
	 * Password special character requirement for password control.
	 * Used to inform user about password requirement.
	 */
	_passwordSpecialCharacterReqMet = false;

	/**
	 * Requires user to enter the same password for confirm password field.
	 */
	_confirmPasswordNotMatchReqMet = false;

	/**
	 *  Reset password form email control status changes$.
	 */
	_resetPasswordFormEmailControlStatusChanges$: Observable<string>;

	/**
	 * Subscriptions for this component.
	 */
	private _subscription = new Subscription();

	/**
	 * Creates an instance of reset password component.
	 * @param fb
	 * @param facade
	 */
	constructor(private facade: AuthFacadeService, cd: ChangeDetectorRef) {
		super(facade.translateValidationErrorService, facade.log, cd);
		this.problemDetails = this.facade.problemDetails$;
		this.internalServerErrorDetails = this.facade.internalServerErrorDetails$;
	}

	/**
	 * NgOnInit life cycle.
	 */
	ngOnInit(): void {
		this.facade.log.trace('Initialized.', this);
		this._initForm();
		this._resetPasswordFormEmailControlStatusChanges$ = this._resetPasswordForm.get('email').statusChanges.pipe(
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			tap((_: string) => {
				if (this._internalServerErrorOccured) {
					// null out internalServerErrorDetails when the email
					// control statusChanges. Necessary to remove old message
					// and display new one.
					this._internalServerErrorDetails = null;
				}
			})
		);
	}

	/**
	 * NgOnDestroy life cycle.
	 */
	ngOnDestroy(): void {
		this.facade.log.trace('Destroyed.', this);
		this._subscription.unsubscribe();
	}

	/**
	 * Event handler for when user submits password reset form.
	 */
	_onSubmit(): void {
		const model = this._resetPasswordForm.value as PasswordReset;
		this.facade.onResetPassword(model);
	}

	/**
	 * Inits form for reset-password component.
	 */
	private _initForm(): void {
		this._resetPasswordForm = this._initResetPasswordForm();
	}

	/**
	 * Inits reset password form.
	 * @returns reset password form
	 */
	private _initResetPasswordForm(): FormGroup {
		return this.facade.fb.group(
			{
				email: this.facade.fb.control('', [OdmValidators.required, OdmValidators.email]),
				password: this.facade.fb.control('', {
					validators: [
						OdmValidators.required,
						OdmValidators.minLength(8),
						OdmValidators.requireDigit,
						OdmValidators.requireLowercase,
						OdmValidators.requireUppercase,
						OdmValidators.requireNonAlphanumeric,
						OdmValidators.requireThreeUniqueCharacters
					],
					updateOn: 'change'
				}),
				confirmPassword: this.facade.fb.control('', OdmValidators.required)
			},
			{
				validators: OdmValidators.requireConfirmPassword,
				updateOn: 'change'
			}
		);
	}
}
