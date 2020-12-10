import { Injectable } from '@angular/core';
import { RegisterUserModel } from 'app/core/auth/register-user.model';
import { AuthService } from 'app/core/auth/auth.service';
import { Observable } from 'rxjs';
import { NotificationService } from 'app/core/core.module';
import { LoginUserModel } from 'app/core/auth/login-user.model';
import { ProblemDetailsError } from 'app/core/error-handler/problem-details-error.decorator';
import { ProblemDetails } from 'app/core/models/problem-details.model';

@Injectable()
export class AuthFacadeService {
	@ProblemDetailsError() problemDetails$: Observable<ProblemDetails>;

	constructor(private authService: AuthService, private notification: NotificationService) {}

	signupUser(model: RegisterUserModel): void {
		this.authService.signup(model).pipe().subscribe();
	}

	signinUser(model: LoginUserModel): void {
		this.authService.signin(model).pipe().subscribe();
	}
}
