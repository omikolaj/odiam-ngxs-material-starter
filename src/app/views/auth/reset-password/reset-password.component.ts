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
	set problemDetails(value: ProblemDetails) {
		this.facade.log.debug('Problem details emitted.', this);
		this.problemDetailsError = value;
	}

	/**
	 * Emitted when server responds with 50X error.
	 */
	set internalServerErrorDetails(value: InternalServerErrorDetails) {
		this.facade.log.debug('Internal server details emitted.', this);
		this.internalServerError = value;
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
	}

	/**
	 * NgOnInit life cycle.
	 */
	ngOnInit(): void {
		this.facade.log.trace('Initialized.', this);
		this._initForm();
		this._listenForServerErrors();
		this._resetPasswordFormEmailControlStatusChanges$ = this._resetPasswordForm
			.get('email')
			// null out internalServerErrorDetails
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			.statusChanges.pipe(tap((_: string) => (this.internalServerErrorDetails = null)));
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
		this.facade.log.trace('_onSubmit fired.', this);
		const model = this._resetPasswordForm.value as PasswordReset;
		this.facade.onResetPassword(model);
	}

	/**
	 * Subscribes to server errors and sets problem details and internal server error details.
	 */
	private _listenForServerErrors(): void {
		this._subscription.add(this.facade.problemDetails$.pipe(tap((value) => (this.problemDetails = value))).subscribe());
		this._subscription.add(this.facade.internalServerErrorDetails$.pipe(tap((value) => (this.internalServerErrorDetails = value))).subscribe());
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
