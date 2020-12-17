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
import { AccessToken } from 'app/core/auth/access-token.model';
import { AuthState } from 'app/core/auth/auth.store.state';
import { SocialAuthService, SocialUser, GoogleLoginProvider } from 'angularx-social-login';

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
			this.authAsyncService
				.signinWithGoogle(model)
				.pipe(tap((access_token) => this._authenticate(access_token)))
				.subscribe();
		});
	}

	/**
	 * Authenticates user that has signed in or signed up.
	 * @param access_token
	 */
	private _authenticate(access_token: AccessToken, rememberMe?: boolean): void {
		this.store.dispatch(new Auth.Signin({ accessToken: access_token, rememberMe: rememberMe || false }));
		void this.router.navigate(['']);
		setTimeout(() => {
			this._signoutOrRenewAccessToken();
		}, access_token.expires_in * 1000);
	}

	/**
	 * Attempts to refresh access token, otherwise signs user out.
	 */
	private _signoutOrRenewAccessToken(): void {
		// try renew token
		this.authAsyncService
			.tryRenewAccessToken()
			.pipe(
				tap((renewAccessTokenResult) =>
					renewAccessTokenResult.succeeded ? this._authenticate(renewAccessTokenResult.accessToken) : this._initiateSignout()
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
