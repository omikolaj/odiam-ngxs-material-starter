/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormGroup, FormBuilder, ValidationErrors } from '@angular/forms';
import { ValidatorsAsyncService } from 'app/core/form-validators/validators-async.service';
import { OdmValidators } from 'app/core/form-validators/odm-validators';
import { RegisterUserModel } from 'app/core/auth/register-user.model';
import { AuthFacadeService } from '../auth-facade.service';
import { Observable } from 'rxjs';
import { ProblemDetails } from 'app/core/models/problem-details.model';

/**
 * Auth component handles displaying both sign in and sign up views.
 */
@Component({
	selector: 'odm-auth',
	templateUrl: './auth.component.html',
	styleUrls: ['./auth.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthComponent implements OnInit {
	/**
	 * Property used to control if signin or signup view is displayed.
	 */
	_createAccount: 'right-panel-active' | '';
	/**
	 * Signin form of auth component.
	 */
	_signinForm: FormGroup;
	/**
	 * Signup form of auth component.
	 */
	_signupForm: FormGroup;
	/**
	 * Field is required message.
	 */
	_fieldRequiredMessage = 'This field is required';

	@Input() validationProblemDetails: ProblemDetails;

	/**
	 * Creates an instance of auth component.
	 * @param fb
	 * @param asyncValidators
	 * @param facade
	 */
	constructor(private fb: FormBuilder, private asyncValidators: ValidatorsAsyncService, private facade: AuthFacadeService) {}

	/**
	 * NgOnInit life cycle.
	 */
	ngOnInit(): void {
		this._initForms();
	}

	/**
	 * Event handler for when new user is attempting to sign up.
	 */
	_onSignup(): void {
		const registerUserModel = this._signupForm.value as RegisterUserModel;
		this.facade.signupUser(registerUserModel);
	}

	/**
	 * Event handler for when user is attempting to sign in.
	 */
	_onSignin(): void {}

	/**
	 * Gets email error message.
	 * @param errors
	 * @returns email error message
	 */
	_getEmailErrorMessage(errors: ValidationErrors): string {
		if (errors['required']) {
			return 'This field is required';
		} else if (errors['email']) {
			return 'Invalid e-mail format';
		} else if (errors['nonUnique']) {
			// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
			return `E-mail ${errors['nonUnique']} is taken`;
		}
	}

	/**
	 * Gets password error message.
	 * @param errors
	 * @returns password error message
	 */
	_getPasswordErrorMessage(errors: ValidationErrors): string {
		if (errors['required']) {
			return 'This field is required';
		} else if (errors['number']) {
			return 'Password must contain number';
		} else if (errors['uppercase']) {
			return 'Password must contain one uppercase letter';
		} else if (errors['lowercase']) {
			return 'Password must contain one lowercase letter';
		} else if (errors['nonAlphanumeric']) {
			// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
			return `Password must contain one of: ${errors['requiredNonAlphanumeric']}`;
		} else if (errors['minlength']) {
			// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
			return `Password has to be at least ${errors['minlength']['requiredLength']} characters long`;
		}
	}

	/**
	 * Inits singin and signup forms.
	 */
	private _initForms(): void {
		this._signinForm = this._initSigninForm();
		this._signupForm = this._initSignupForm();
	}

	/**
	 * Creates FormGroup for signin form.
	 * @returns signin form
	 */
	private _initSigninForm(): FormGroup {
		return this.fb.group({
			email: this.fb.control('', [OdmValidators.required, OdmValidators.email]),
			password: this.fb.control('', OdmValidators.required)
		});
	}

	/**
	 * Creates FormGroup for signup form.
	 * @returns signup form
	 */
	private _initSignupForm(): FormGroup {
		return this.fb.group({
			email: this.fb.control('', {
				validators: [OdmValidators.required, OdmValidators.email],
				asyncValidators: [this.asyncValidators.checkIfEmailIsUnique()],
				updateOn: 'change'
			}),
			firstName: this.fb.control('', [OdmValidators.required]),
			lastName: this.fb.control(''),
			password: this.fb.control('', [
				OdmValidators.required,
				OdmValidators.minLength(8),
				OdmValidators.requireDigit,
				OdmValidators.requireLowercase,
				OdmValidators.requireUppercase,
				OdmValidators.requireNonAlphanumeric
			])
		});
	}
}
