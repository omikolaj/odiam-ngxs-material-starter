import { Injectable } from '@angular/core';
import { SignupUserModel } from 'app/core/auth/signup-user.model';
import { AuthAsyncService } from 'app/core/auth/auth-async.service';
import { Observable } from 'rxjs';
import { NotificationService } from 'app/core/core.module';
import { SigninUserModel } from 'app/core/auth/signin-user.model';
import { ProblemDetailsError } from 'app/core/error-handler/problem-details-error.decorator';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerError } from 'app/core/error-handler/internal-server-error.decorator';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { tap } from 'rxjs/operators';
import { Store, Select } from '@ngxs/store';
import * as Auth from '../../core/auth/auth.store.actions';
import { Router } from '@angular/router';
import { AccessTokenModel } from 'app/core/auth/access-token.model';
import { AuthState } from 'app/core/auth/auth.store.state';
import { SocialAuthService, SocialUser, GoogleLoginProvider, FacebookLoginProvider } from 'angularx-social-login';
import { UsersAsyncService } from 'app/core/services/users-async.service';
import { PasswordResetModel } from 'app/core/auth/password-reset.model';

/**
 * Auth facade service.
 */
@Injectable()
export class AuthFacadeService {
	@ProblemDetailsError() problemDetails$: Observable<ProblemDetails>;
	@InternalServerError() internalServerErrorDetails$: Observable<InternalServerErrorDetails>;
	@Select(AuthState.selectRememberMe) rememberMe$: Observable<boolean>;

	/**
	 * Creates an instance of auth facade service.
	 * @param authAsyncService
	 * @param notification
	 * @param store
	 * @param router
	 */
	constructor(
		private authAsyncService: AuthAsyncService,
		private usersAsyncService: UsersAsyncService,
		private notification: NotificationService,
		private store: Store,
		private router: Router,
		private socialAuthService: SocialAuthService
	) {}

	/**
	 * Changes remember me state.
	 * @param event
	 */
	onRememberMeChanged(event: boolean): void {
		this.store.dispatch(new Auth.RememberMeOptionChange(event));
	}

	/**
	 * Sends reset password link to the passed in email.
	 * @param email
	 */
	onForgotPassword(email: string): void {
		this.usersAsyncService.forgotPassword(email).subscribe();
	}

	/**
	 * Resets user password.
	 * @param model
	 */
	onResetPassword(model: PasswordResetModel): void {
		this.usersAsyncService.resetPassword(model).subscribe();
	}

	/**
	 * Signs user up.
	 * @param model
	 */
	signupUser(model: SignupUserModel): void {
		this.authAsyncService
			.signup(model)
			.pipe(tap((access_token) => this._authenticate(access_token)))
			.subscribe();
	}

	/**
	 * Signs user in.
	 * @param model
	 */
	signinUser(model: SigninUserModel): void {
		this.authAsyncService
			.signin(model)
			.pipe(tap((access_token) => this._authenticate(access_token, model.rememberMe)))
			.subscribe();
	}

	/**
	 * Signs user in with google.
	 */
	signinUserWithGoogle(): void {
		void this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID).then((model: SocialUser) => {
			console.log(model);
			this.authAsyncService
				.signinWithGoogle(model)
				.pipe(tap((access_token) => this._authenticate(access_token)))
				.subscribe();
		});
	}

	/**
	 * Signs user in with facebook.
	 */
	signinUserWithFacebook(): void {
		void this.socialAuthService.signIn(FacebookLoginProvider.PROVIDER_ID).then((model: SocialUser) => {
			console.log(model);
			this.authAsyncService
				.signinWithFacebook(model)
				.pipe(tap((access_token) => this._authenticate(access_token)))
				.subscribe();
		});
	}

	/**
	 * Authenticates user that has signed in or signed up.
	 * @param access_token
	 */
	private _authenticate(access_token: AccessTokenModel, rememberMe?: boolean): void {
		this.store.dispatch(new Auth.Signin({ AccessTokenModel: access_token, rememberMe: rememberMe || false }));
		void this.router.navigate(['']);
		setTimeout(() => {
			this._signoutOrRenewAccessTokenModel();
		}, access_token.expires_in * 1000);
	}

	/**
	 * Attempts to refresh access token, otherwise signs user out.
	 */
	private _signoutOrRenewAccessTokenModel(): void {
		// try renew token
		this.authAsyncService
			.tryRenewAccessTokenModel()
			.pipe(
				tap((renewAccessTokenModelResult) =>
					renewAccessTokenModelResult.succeeded ? this._authenticate(renewAccessTokenModelResult.AccessTokenModel) : this._initiateSignout()
				)
			)
			.subscribe();
	}

	/**
	 * Initiates signout procedure.
	 */
	private _initiateSignout(): void {
		this.store.dispatch(new Auth.Signout());
		void this.router.navigate(['auth']);
	}
}
