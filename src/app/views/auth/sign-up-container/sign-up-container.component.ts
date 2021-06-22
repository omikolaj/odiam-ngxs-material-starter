import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Observable, Subscription, merge } from 'rxjs';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { FormGroup } from '@angular/forms';
import { MinScreenSizeQuery } from 'app/shared/screen-size-queries';
import { OdmValidators, MinPasswordLength } from 'app/core/form-validators/odm-validators';
import { rightLeftFadeInAnimation } from 'app/core/core.module';
import { AuthSandboxService } from '../auth-sandbox.service';
import { SignupUser } from 'app/core/models/auth/signup-user.model';
import { ActiveAuthType } from 'app/core/models/auth/active-auth-type.model';
import { AuthTypeRouteUrl } from 'app/core/models/auth/auth-type-route-url.model';
import { PasswordRequirement } from 'app/core/models/auth/password-requirement.model';
import { getPasswordRequirements } from 'app/core/utilities/password-requirements.utility';
import { tap } from 'rxjs/operators';
import { PasswordHelpToggleClass } from 'app/core/models/auth/password-help-toggle-class.model';
import { ActivatedRoute } from '@angular/router';
import { ActionCompletion } from '@ngxs/store';

/**
 * Sign up container component.
 */
@Component({
	selector: 'odm-sign-up-container',
	templateUrl: './sign-up-container.component.html',
	styleUrls: ['./sign-up-container.component.scss'],
	animations: [rightLeftFadeInAnimation],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignUpContainerComponent implements OnInit, OnDestroy {
	/**
	 * Emitted when server responds with 40X error.
	 */
	_problemDetails$: Observable<ProblemDetails>;

	/**
	 * Emitted when server responds with 50X error.
	 */
	_internalServerErrorDetails$: Observable<InternalServerErrorDetails>;

	/**
	 * Signup form of auth component.
	 */
	_signupForm: FormGroup;

	/**
	 * Whether user registration completed without errors.
	 */
	_registrationCompleted$: Observable<boolean>;

	/**
	 * Whether specified screen width was matched.
	 */
	_breakpointStateScreenMatcher$: Observable<BreakpointState>;

	/**
	 * Whether to display sign-in or sign-up component.
	 */
	_activeAuthType$: Observable<string>;

	/**
	 * Requires user to enter the same password for confirm password field.
	 */
	_confirmPasswordMatchReqMet = false;

	/**
	 * Password requirements required for new user.
	 */
	_passwordRequirements: PasswordRequirement[] = [];

	/**
	 * Password help toggle class.
	 */
	_passwordHelpToggleClass: PasswordHelpToggleClass = 'auth__password-field-help-off';

	/**
	 * Whether Auth.Signin action has been dispatched and completed.
	 */
	signinActionCompleted$: Observable<ActionCompletion<any, Error>>;

	/**
	 * Rxjs subscriptions for this component.
	 */
	private readonly _subscription = new Subscription();

	/**
	 * Creates an instance of sign up container component.
	 * @param _sb
	 * @param _asyncValidators
	 * @param breakpointObserver
	 */
	constructor(breakpointObserver: BreakpointObserver, private _sb: AuthSandboxService, private _route: ActivatedRoute) {
		this._problemDetails$ = _sb.problemDetails$;
		this._internalServerErrorDetails$ = _sb.internalServerErrorDetails$;
		this._breakpointStateScreenMatcher$ = breakpointObserver.observe([MinScreenSizeQuery.md]);
		this._activeAuthType$ = _sb.activeAuthType$;
		this._registrationCompleted$ = _sb.registrationCompleted$;
		this.signinActionCompleted$ = _sb.signInActionCompleted$;
	}

	/**
	 * NgOnInit life cycle.
	 */
	ngOnInit(): void {
		this._sb.log.trace('Initialized.', this);
		this._initForms();
		// initialize password requirements.
		this._passwordRequirements = this._initPasswordRequirements();
		// subscribe to confirm password control to check if passwords match.
		this._subscription.add(this._validateFormConfirmPasswordField$().subscribe());

		// [CONFIRMATION-WALL]: Remove code if confirmation wall is required.
		this._subscription.add(this._listenIfUserSignedIn$().subscribe());

		// [CONFIRMATION-WALL]: Keep code if confirmation wall is required.
		// subscribe to user registration completed events.
		// this._subscription.add(this._onRegistrationCompleted$().subscribe());

		// subscribe to server errors.
		this._subscription.add(this._listenForServerErrors$().subscribe());
	}

	/**
	 * NgOnDestroy life cycle.
	 */
	ngOnDestroy(): void {
		this._sb.log.trace('Destroyed.', this);
		this._subscription.unsubscribe();
	}

	/**
	 * Event handler for when user signs up.
	 * @param model
	 */
	_onSignupSubmitted(model: SignupUser): void {
		this._sb.log.trace('_onSignupSubmitted event handler fired.', this);
		this._sb.signupUser(model);
	}

	/**
	 * Event handler for when user signs in with google.
	 */
	_onSigninWithGoogleSubmitted(): void {
		this._sb.log.trace('_onSigninWithGoogleSubmitted event handler fired.', this);
		this._sb.signinUserWithGoogle();
	}

	/**
	 * Event handler for when user signs in with facebook.
	 */
	_onSigninWithFacebookSubmitted(): void {
		this._sb.log.trace('_onSigninWithFacebookSubmitted event handler fired.', this);
		this._sb.signinUserWithFacebook();
	}

	/**
	 * Used to switch view to signin context.
	 */
	_onSwitchToSigninClicked(event: ActiveAuthType): void {
		this._sb.log.trace('_switchToSignup fired.', this);
		const activeAuthType = { activeAuthType: event };
		const routeUrl: AuthTypeRouteUrl = event === 'sign-in-active' ? 'sign-in' : 'sign-up';
		this._sb.updateActiveAuthType(activeAuthType);
		setTimeout(() => {
			void this._sb.router.navigate([routeUrl], { relativeTo: this._route.parent });
		}, 300);
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
	 * Listens to server errors and sets problem details and internal server error details.
	 * @returns emits ProblemDetails | InternalServerErrorDetails observable
	 */
	private _listenForServerErrors$(): Observable<ProblemDetails | InternalServerErrorDetails> {
		this._sb.log.trace('_listenForServerErrors$ fired.', this);
		return merge(this._problemDetails$, this._internalServerErrorDetails$).pipe(
			tap(() => this._userRegistrationSuccess({ registrationCompleted: false }))
		);
	}

	/**
	 * Subscribes to user registration completed event.
	 * @returns whether user registration completed$ without errors.
	 * [CONFIRMATION-WALL]: Keep code if confirmation wall is required.
	 */
	// private _onRegistrationCompleted$(): Observable<any> {
	// 	this._sb.log.trace('_onRegistrationCompleted$ fired.', this);
	// 	return this._registrationCompleted$.pipe(
	// 		tap((completed: boolean) => {
	// 			if (completed) {
	// 				void this._sb.router.navigate(['successful-registration'], { relativeTo: this._route.parent });
	// 				this._userRegistrationSuccess({ registrationCompleted: false });
	// 			}
	// 		})
	// 	);
	// }

	/**
	 * Listens if user has signed in.
	 * @returns if user signed in$
	 * [CONFIRMATION-WALL]: Remove code if confirmation wall is required.
	 */
	private _listenIfUserSignedIn$(): Observable<ActionCompletion<any, Error>> {
		return this.signinActionCompleted$.pipe(tap(() => void this._sb.router.navigate(['account'])));
	}

	/**
	 * Whether user registration completed without errors.
	 * @param value
	 */
	private _userRegistrationSuccess(value: { registrationCompleted: boolean }): void {
		this._sb.userRegistrationCompleted(value);
	}

	/**
	 * Validates form confirm password field.
	 * @param form
	 * @returns form confirm password field
	 */
	private _validateFormConfirmPasswordField$(): Observable<any> {
		return this._signupForm.valueChanges.pipe(
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			tap((_) => {
				if (this._signupForm.hasError('notSame')) {
					this._confirmPasswordMatchReqMet = false;
				} else {
					this._confirmPasswordMatchReqMet = true;
				}
			})
		);
	}

	/**
	 * Inits singin and signup forms.
	 */
	private _initForms(): void {
		this._signupForm = this._initSignupForm();
	}

	/**
	 * Inits new user's password requirements.
	 */
	private _initPasswordRequirements(): PasswordRequirement[] {
		return getPasswordRequirements();
	}

	/**
	 * Creates FormGroup for signup form.
	 * @returns signup form
	 */
	private _initSignupForm(): FormGroup {
		return this._sb.fb.group(
			{
				email: this._sb.fb.control('', {
					validators: [OdmValidators.required, OdmValidators.email],
					asyncValidators: [this._sb.asyncValidators.checkIfEmailIsUnique()],
					updateOn: 'blur'
				}),
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
