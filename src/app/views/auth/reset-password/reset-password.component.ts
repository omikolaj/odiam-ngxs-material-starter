import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { ROUTE_ANIMATIONS_ELEMENTS } from 'app/core/core.module';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { Observable, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { OdmValidators, MinPasswordLength } from 'app/core/form-validators/odm-validators';
import { AuthBase } from '../auth-base';
import { AuthSandboxService } from '../auth-sandbox.service';
import { PasswordReset } from 'app/core/models/auth/password-reset.model';
import { PasswordHelpToggleClass } from 'app/core/models/auth/password-help-toggle-class.model';
import { PasswordRequirement } from 'app/core/models/auth/password-requirement.model';
import { getPasswordRequirements } from 'app/core/utilities/password-requirements.utility';
import { ActivatedRoute } from '@angular/router';

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
		this._sb.log.debug('Problem details emitted.', this);
		this.problemDetailsError = value;
	}

	/**
	 * Emitted when server responds with 50X error.
	 */
	set internalServerErrorDetails(value: InternalServerErrorDetails) {
		this._sb.log.debug('Internal server details emitted.', this);
		this.internalServerError = value;
	}

	/**
	 * Route animations.
	 */
	readonly _routeAnimationsElements = ROUTE_ANIMATIONS_ELEMENTS;

	/**
	 * Password help toggle class.
	 */
	_passwordHelpToggleClass: PasswordHelpToggleClass = 'auth__password-field-help-off';

	/**
	 * Requires user to enter the same password for confirm password field.
	 */
	_confirmPasswordMatchReqMet = false;

	/**
	 * Password requirements required for new user.
	 */
	_passwordRequirements: PasswordRequirement[] = [];

	/**
	 * Password control of sign up component.
	 */
	_passwordControl: AbstractControl;

	/**
	 *  Reset password form email control status changes$.
	 */
	_resetPasswordFormEmailControlStatusChanges$: Observable<string>;

	/**
	 * Rxjs subscriptions for this component.
	 */
	private readonly _subscription = new Subscription();

	/**
	 * Creates an instance of reset password component.
	 * @param _fb
	 * @param _sb
	 */
	constructor(private _sb: AuthSandboxService, protected cd: ChangeDetectorRef, private _route: ActivatedRoute) {
		super(_sb.translateValidationErrorService, _sb.log, cd);
	}

	/**
	 * NgOnInit life cycle.
	 */
	ngOnInit(): void {
		this._sb.log.trace('Initialized.', this);
		this._initForm();
		this._passwordRequirements = this._initPasswordRequirements();
		this._passwordControl = this._resetPasswordForm.get('password');
		this._subscription.add(this._validateFormConfirmPasswordField(this._resetPasswordForm).subscribe());
		this._listenForServerErrors();
	}

	/**
	 * NgOnDestroy life cycle.
	 */
	ngOnDestroy(): void {
		this._sb.log.trace('Destroyed.', this);
		this._subscription.unsubscribe();
	}

	/**
	 * Event handler for when user submits password reset form.
	 */
	_onSubmit(): void {
		this._sb.log.trace('_onSubmit fired.', this);
		const model = this._resetPasswordForm.value as PasswordReset;
		model.userId = this._route.snapshot.queryParams['userId'] as string;
		model.passwordResetToken = this._route.snapshot.queryParams['code'] as string;
		this._sb.onResetPassword(model);
	}

	/**
	 * Event handler when user toggles password help.
	 */
	_onPasswordHelpToggled(): void {
		this._sb.log.trace('_onPasswordHelpToggled fired.', this);
		if (this._passwordHelpToggleClass === 'auth__password-field-help-off') {
			this._passwordHelpToggleClass = 'auth__password-field-help-on';
		} else {
			this._passwordHelpToggleClass = 'auth__password-field-help-off';
		}
	}

	/**
	 * Subscribes to server errors and sets problem details and internal server error details.
	 */
	private _listenForServerErrors(): void {
		this._subscription.add(
			this._sb.problemDetails$
				.pipe(
					tap((value) => {
						this.problemDetails = value;
						this.cd.detectChanges();
					})
				)
				.subscribe()
		);
		this._subscription.add(
			this._sb.internalServerErrorDetails$
				.pipe(
					tap((value) => {
						this.internalServerErrorDetails = value;
						this.cd.detectChanges();
					})
				)
				.subscribe()
		);
	}

	/**
	 * Inits new user's password requirements.
	 */
	private _initPasswordRequirements(): PasswordRequirement[] {
		return getPasswordRequirements();
	}

	/**
	 * Validates form confirm password field.
	 * @param form
	 * @returns form confirm password field
	 */
	private _validateFormConfirmPasswordField(form: FormGroup): Observable<any> {
		return form.valueChanges.pipe(
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			tap((_) => {
				if (form.hasError('notSame')) {
					this._confirmPasswordMatchReqMet = false;
				} else {
					this._confirmPasswordMatchReqMet = true;
				}
			})
		);
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
		return this._sb.fb.group(
			{
				password: this._sb.fb.control('', {
					validators: [
						OdmValidators.required,
						OdmValidators.minLength(MinPasswordLength),
						OdmValidators.requireDigit,
						OdmValidators.requireLowercase,
						OdmValidators.requireUppercase,
						OdmValidators.requireNonAlphanumeric,
						OdmValidators.requireThreeUniqueCharacters
					],
					updateOn: 'change'
				}),
				confirmPassword: this._sb.fb.control('', OdmValidators.required)
			},
			{
				validators: OdmValidators.requireConfirmPassword,
				updateOn: 'change'
			}
		);
	}
}
