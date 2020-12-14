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

@Injectable()
export class AuthFacadeService {
	@ProblemDetailsError() problemDetails$: Observable<ProblemDetails>;
	@InternalServerError() internalServerErrorDetails$: Observable<InternalServerErrorDetails>;

	constructor(private authService: AuthService, private notification: NotificationService) {}

	signupUser(model: SignupUserModel): void {
		this.authService.signup(model).pipe().subscribe();
	}

	signinUser(model: SigninUserModel): void {
		this.authService.signin(model).pipe().subscribe();
	}
}
