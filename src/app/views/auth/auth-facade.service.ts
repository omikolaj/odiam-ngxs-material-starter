import { Injectable } from '@angular/core';
import { SignupUserModel } from 'app/core/auth/signup-user.model';
import { AuthService } from 'app/core/auth/auth.service';
import { Observable } from 'rxjs';
import { NotificationService } from 'app/core/core.module';
import { SigninUserModel } from 'app/core/auth/signin-user.model';
import { ProblemDetailsError } from 'app/core/error-handler/problem-details-error.decorator';
import { ProblemDetails } from 'app/core/models/problem-details.model';

@Injectable()
export class AuthFacadeService {
	@ProblemDetailsError() problemDetails$: Observable<ProblemDetails>;

	constructor(private authService: AuthService, private notification: NotificationService) {}

	signupUser(model: SignupUserModel): void {
		this.authService.signup(model).pipe().subscribe();
	}

	signinUser(model: SigninUserModel): void {
		this.authService.signin(model).pipe().subscribe();
	}
}
