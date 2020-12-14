import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AuthFacadeService } from '../auth-facade.service';
import { Observable } from 'rxjs';
import { FormGroup, FormBuilder } from '@angular/forms';
import { OdmValidators } from 'app/core/form-validators/odm-validators';
import { AsyncValidatorsService } from 'app/core/form-validators/validators-async.service';
import { SignupUserModel } from 'app/core/auth/signup-user.model';
import { SigninUserModel } from 'app/core/auth/signin-user.model';
import { ROUTE_ANIMATIONS_ELEMENTS } from 'app/core/core.module';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';

/**
 * AuthContainer component
 */
@Component({
	selector: 'odm-auth-container',
	templateUrl: './auth-container.component.html',
	styleUrls: ['./auth-container.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthContainerComponent implements OnInit {
	/**
	 * Route animations elements of auth container component.
	 */
	_routeAnimationsElements = ROUTE_ANIMATIONS_ELEMENTS;

	/**
	 * Validation problem details$ of auth container component when form validations get passed angular but fail on the server.
	 */
	_problemDetails$: Observable<ProblemDetails>;

	/**
	 * Internal server error details$ of auth container component.
	 */
	_internalServerErrorDetails$: Observable<InternalServerErrorDetails>;
	/**
	 * Signin form of auth component.
	 */
	_signinForm: FormGroup;
	/**
	 * Signup form of auth component.
	 */
	_signupForm: FormGroup;

	/**
	 * Creates an instance of auth container component.
	 * @param facade
	 * @param asyncValidators
	 * @param fb
	 */
	constructor(private facade: AuthFacadeService, private asyncValidators: AsyncValidatorsService, private fb: FormBuilder) {
		this._problemDetails$ = facade.problemDetails$;
		this._internalServerErrorDetails$ = facade.internalServerErrorDetails$;
	}

	/**
	 * NgOnInit life cycle.
	 */
	ngOnInit(): void {
		this._initForms();
	}

	/**
	 * Event handler for when user signs in.
	 * @param model
	 */
	_onSigninSubmitted(model: SigninUserModel): void {
		this.facade.signinUser(model);
	}

	/**
	 * Event handler for when user signs up.
	 * @param model
	 */
	_onSignupSubmitted(model: SignupUserModel): void {
		this.facade.signupUser(model);
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
			password: this.fb.control('', [OdmValidators.required])
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
				updateOn: 'blur'
			}),
			firstName: this.fb.control('', [OdmValidators.required]),
			lastName: this.fb.control(''),
			password: this.fb.control('', {
				validators: [
					OdmValidators.required,
					OdmValidators.minLength(8),
					OdmValidators.requireDigit,
					OdmValidators.requireLowercase,
					OdmValidators.requireUppercase,
					OdmValidators.requireNonAlphanumeric
				],
				updateOn: 'change'
			})
		});
	}
}
