import { Injectable } from '@angular/core';
import { RegisterUserModel } from 'app/core/auth/register-user.model';
import { AuthService } from 'app/core/auth/auth.service';
import { tap } from 'rxjs/operators';
import { ValidationProblemDetails } from 'app/core/validation-problem-details.decorator';
import { Observable } from 'rxjs';
import { ProblemDetails } from 'app/core/models/problem-details.model';

@Injectable()
export class AuthFacadeService {
	@ValidationProblemDetails() validationProblemDetails$: Observable<ProblemDetails>;

	constructor(private authService: AuthService) {}

	signupUser(registerModel: RegisterUserModel): void {
		this.authService
			.signup(registerModel)
			.pipe(tap((value) => console.log('signed up', value)))
			.subscribe();
	}
}
