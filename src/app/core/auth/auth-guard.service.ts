import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Store } from '@ngxs/store';
import { AuthState } from './auth.store.state';
import { tap } from 'rxjs/operators';
import { LogService } from '../logger/log.service';

/**
 * Authentication guard service which determines if user is authenticated.
 */
@Injectable({
	providedIn: 'root'
})
export class AuthGuardService implements CanActivate {
	/**
	 * Creates an instance of auth guard service.
	 * @param store
	 * @param router
	 * @param log
	 */
	constructor(private store: Store, private router: Router, private log: LogService) {}

	/**
	 * Determines whether user can activate this route.
	 * @returns user is authentication status.
	 */
	canActivate(): Observable<boolean> {
		this.log.trace('canActivate executed.', this);
		return this.store.select(AuthState.selectIsAuthenticated).pipe(
			tap((isAuthenticated) => this.log.debug('canActivate: Is user authenticated:', this, isAuthenticated)),
			tap((isAuthenticated) => (isAuthenticated ? null : void this.router.navigate(['auth/sign-in'])))
		);
	}
}
