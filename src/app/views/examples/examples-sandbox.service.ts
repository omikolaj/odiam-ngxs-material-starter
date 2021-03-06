import { Injectable } from '@angular/core';
import { LogService } from 'app/core/logger/log.service';
import { Select } from '@ngxs/store';
import { AuthState } from 'app/core/auth/auth.store.state';
import { Observable } from 'rxjs';

/**
 * Examples sandbox service.
 */
@Injectable()
export class ExamplesSandboxService {
	/**
	 * Whether user is authenticated or not.
	 */
	@Select(AuthState.selectIsAuthenticated) isAuthenticated$: Observable<boolean>;

	/**
	 * Creates an instance of examples sandbox service.
	 * @param log
	 */
	constructor(public log: LogService) {}
}
