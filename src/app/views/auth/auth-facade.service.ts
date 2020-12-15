import { Injectable } from '@angular/core';
import { SignupUserModel } from 'app/core/auth/signup-user.model';
import { AuthService } from 'app/core/auth/auth.service';
import { Observable } from 'rxjs';
import { NotificationService } from 'app/core/core.module';
import { SigninUserModel } from 'app/core/auth/signin-user.model';
import { ProblemDetailsError } from 'app/core/error-handler/problem-details-error.decorator';
import { ProblemDetails } from 'app/core/models/problem-details.model';
import { InternalServerError } from 'app/core/error-handler/internal-server-error.decorator';
import { InternalServerErrorDetails } from 'app/core/models/internal-server-error-details.model';
import { tap } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import * as Auth from '../../core/auth/auth.store.actions';
import { Router } from '@angular/router';
import { AccessToken } from 'app/core/auth/access-token.model';
import { AuthState } from 'app/core/auth/auth.store.state';

/**
 * Auth facade service.
 */
@Injectable()
export class AuthFacadeService {
	@ProblemDetailsError() problemDetails$: Observable<ProblemDetails>;
	@InternalServerError() internalServerErrorDetails$: Observable<InternalServerErrorDetails>;

	/**
	 * Creates an instance of auth facade service.
	 * @param authService
	 * @param notification
	 * @param store
	 * @param router
	 */
	constructor(private authService: AuthService, private notification: NotificationService, private store: Store, private router: Router) {}

	/**
	 * Signs user up.
	 * @param model
	 */
	signupUser(model: SignupUserModel): void {
		this.authService
			.signup(model)
			.pipe(tap((access_token) => this._authenticate(access_token)))
			.subscribe();
	}

	/**
	 * Signs user in.
	 * @param model
	 */
	signinUser(model: SigninUserModel): void {
		this.authService
			.signin(model)
			.pipe(tap((access_token) => this._authenticate(access_token)))
			.subscribe();
	}

	/**
	 * Authenticates user that has signed in or signed up.
	 * @param access_token
	 */
	private _authenticate(access_token: AccessToken): void {
		this.store.dispatch(new Auth.Signin(access_token));
		void this.router.navigate(['']);
		setTimeout(() => {
			this.store.dispatch(new Auth.Signout());
			void this.router.navigate(['auth']);
		}, access_token.expires_in * 1000);
	}
}
